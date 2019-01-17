/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';

import getTitle from '../../utils/EntityTitleUtils';
import { EXPLORE } from '../../utils/constants/StateConstants';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  RE_INDEX_ENTITIES_BY_ID,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  UNMOUNT_EXPLORE,
  UPDATE_FILTERED_TYPES,
  loadEntityNeighbors,
  searchEntitySetData,
  selectEntity
} from './ExploreActionFactory';

import {
  CLEAR_TOP_UTILIZERS_RESULTS,
  UNMOUNT_TOP_UTILIZERS,
  getTopUtilizers,
  loadTopUtilizerNeighbors
} from '../toputilizers/TopUtilizersActionFactory';

const {
  BREADCRUMBS,
  ENTITY_NEIGHBORS_BY_ID,
  ENTITIES_BY_ID,
  FILTERED_PROPERTY_TYPES,
  IS_LOADING_ENTITY_NEIGHBORS,
  IS_SEARCHING_DATA,
  SEARCH_RESULTS,
  UNFILTERED_SEARCH_RESULTS
} = EXPLORE;

const INITIAL_STATE :Map<> = fromJS({
  [BREADCRUMBS]: List(),
  [ENTITY_NEIGHBORS_BY_ID]: Map(),
  [ENTITIES_BY_ID]: Map(),
  [FILTERED_PROPERTY_TYPES]: Set(),
  [IS_LOADING_ENTITY_NEIGHBORS]: false,
  [IS_SEARCHING_DATA]: false,
  [SEARCH_RESULTS]: List(),
  [UNFILTERED_SEARCH_RESULTS]: List()
});

const filterEntity = (entity, filteredTypes) => {
  let filteredEntity = entity;

  filteredTypes.forEach((fqn) => {
    filteredEntity = filteredEntity.delete(fqn);
  });

  return filteredEntity;
};

const filterSearchResults = (searchResults, filteredTypes) => searchResults
  .map(entity => filterEntity(entity, filteredTypes));

const updateEntitiesIdForNeighbors = (initEntitiesById, neighborList, filteredTypes, selectedEntitySetId) => {
  let entitiesById = initEntitiesById;
  neighborList.forEach((neighborObj) => {
    const association = neighborObj.get('associationDetails', Map());
    const neighbor = neighborObj.get('neighborDetails', Map());
    if (association) {
      const associationEntityKeyId = getEntityKeyId(association);
      entitiesById = entitiesById.set(
        associationEntityKeyId,
        entitiesById.get(associationEntityKeyId, Map()).merge(association)
      );
    }
    if (neighbor) {
      const neighborEntityKeyId = getEntityKeyId(neighbor);
      let updatedEntity = entitiesById.get(neighborEntityKeyId, Map()).merge(neighbor);
      if (!selectedEntitySetId || selectedEntitySetId === neighborObj.getIn(['neighborEntitySet', 'id'])) {
        updatedEntity = filterEntity(updatedEntity, filteredTypes);
      }

      entitiesById = entitiesById.set(neighborEntityKeyId, updatedEntity);
    }
  });

  return entitiesById;
};

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadEntityNeighbors.case(action.type): {
      return loadEntityNeighbors.reducer(state, action, {
        REQUEST: () => {
          const id = getEntityKeyId(action.value.entity);
          return state
            .set(IS_LOADING_ENTITY_NEIGHBORS, true)
            .setIn([ENTITY_NEIGHBORS_BY_ID, id], state.getIn([ENTITY_NEIGHBORS_BY_ID, id], List()));
        },
        SUCCESS: () => {
          const { entity, neighbors, selectedEntitySetId } = action.value;
          const neighborList = fromJS(neighbors);
          const entityKeyId = getEntityKeyId(entity);

          const entitiesById = updateEntitiesIdForNeighbors(
            state.get(ENTITIES_BY_ID),
            neighborList,
            state.get(FILTERED_PROPERTY_TYPES),
            selectedEntitySetId
          );

          return state
            .setIn([ENTITY_NEIGHBORS_BY_ID, entityKeyId], neighborList)
            .set(ENTITIES_BY_ID, entitiesById);
        },
        FAILURE: () => state.setIn([ENTITY_NEIGHBORS_BY_ID, getEntityKeyId(action.value.entity)], List()),
        FINALLY: () => state.set(IS_LOADING_ENTITY_NEIGHBORS, false)
      });
    }

    case getTopUtilizers.case(action.type): {
      return getTopUtilizers.reducer(state, action, {
        REQUEST: () => state.set(BREADCRUMBS, List()),
        SUCCESS: () => {
          let entitiesById = state.get(ENTITIES_BY_ID);

          fromJS(action.value.topUtilizers).forEach((entity) => {
            const entityKeyId = getEntityKeyId(entity);
            entitiesById = entitiesById.set(
              entityKeyId,
              filterEntity(entitiesById.get(entityKeyId, Map()).merge(entity), state.get(FILTERED_PROPERTY_TYPES))
            );
          });

          return state.set(ENTITIES_BY_ID, entitiesById);
        }
      });
    }

    case loadTopUtilizerNeighbors.case(action.type): {
      return loadTopUtilizerNeighbors.reducer(state, action, {
        SUCCESS: () => {
          const immutableNeighborsById = fromJS(action.value.neighborsById);
          const neighborsById = state.get(ENTITY_NEIGHBORS_BY_ID).merge(immutableNeighborsById);
          let entitiesById = state.get(ENTITIES_BY_ID);
          immutableNeighborsById.valueSeq().forEach((neighborList) => {
            entitiesById = updateEntitiesIdForNeighbors(entitiesById, neighborList, state.get(FILTERED_PROPERTY_TYPES));
          });
          return state.set(ENTITY_NEIGHBORS_BY_ID, neighborsById).set(ENTITIES_BY_ID, entitiesById);
        }
      });
    }

    case searchEntitySetData.case(action.type): {
      return searchEntitySetData.reducer(state, action, {
        REQUEST: () => state
          .set(IS_SEARCHING_DATA, true)
          .set(UNFILTERED_SEARCH_RESULTS, List())
          .set(SEARCH_RESULTS, List()),
        SUCCESS: () => {
          const results = fromJS(action.value);
          let entitiesById = state.get(ENTITIES_BY_ID);
          results.get('hits', List()).forEach((result) => {
            entitiesById = entitiesById.set(
              getEntityKeyId(result),
              filterEntity(result, state.get(FILTERED_PROPERTY_TYPES))
            );
          });
          return state
            .set(UNFILTERED_SEARCH_RESULTS, results)
            .set(SEARCH_RESULTS, filterSearchResults(results, state.get(FILTERED_PROPERTY_TYPES)))
            .set(ENTITIES_BY_ID, entitiesById);
        },
        FAILURE: () => state.set(SEARCH_RESULTS, List()).set(UNFILTERED_SEARCH_RESULTS, List()),
        FINALLY: () => state.set(IS_SEARCHING_DATA, false)
      });
    }

    case SELECT_BREADCRUMB:
      return state.set(BREADCRUMBS, state.get(BREADCRUMBS).slice(0, action.value));

    case SELECT_ENTITY: {
      const { entityKeyId, entitySetId, entityType } = action.value;
      const crumb = {
        [BREADCRUMB.ENTITY_SET_ID]: entitySetId,
        [BREADCRUMB.ENTITY_KEY_ID]: entityKeyId,
        [BREADCRUMB.ON_CLICK]: () => selectEntity(state.get(BREADCRUMBS).size),
        [BREADCRUMB.TITLE]: getTitle(entityType, state.getIn([ENTITIES_BY_ID, entityKeyId], Map()))
      };
      return state.set(BREADCRUMBS, state.get(BREADCRUMBS).push(crumb));
    }

    case UPDATE_FILTERED_TYPES: {
      const filteredTypes = action.value;
      let entitiesById = state.get(ENTITIES_BY_ID);
      state.get(UNFILTERED_SEARCH_RESULTS, List()).forEach((result) => {
        entitiesById = entitiesById.set(getEntityKeyId(result), filterEntity(result, filteredTypes));
      });
      return state
        .set(FILTERED_PROPERTY_TYPES, filteredTypes)
        .set(SEARCH_RESULTS, filterSearchResults(state.get(UNFILTERED_SEARCH_RESULTS), filteredTypes))
        .set(ENTITIES_BY_ID, entitiesById);
    }

    case RE_INDEX_ENTITIES_BY_ID: {
      let entitiesById = state.get(ENTITIES_BY_ID);
      action.value.forEach((result) => {
        entitiesById = entitiesById.set(
          getEntityKeyId(result),
          filterEntity(result, state.get(FILTERED_PROPERTY_TYPES))
        );
      });
      return state.set(ENTITIES_BY_ID, entitiesById);
    }

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case CLEAR_TOP_UTILIZERS_RESULTS:
    case UNMOUNT_TOP_UTILIZERS:
    case UNMOUNT_EXPLORE:
      return state.set(BREADCRUMBS, List())
        .set(IS_LOADING_ENTITY_NEIGHBORS, false)
        .set(IS_SEARCHING_DATA, false)
        .set(SEARCH_RESULTS, List())
        .set(UNFILTERED_SEARCH_RESULTS, List());

    default:
      return state;
  }
}

export default reducer;
