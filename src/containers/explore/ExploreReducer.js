/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import getTitle from '../../utils/EntityTitleUtils';
import { EXPLORE } from '../../utils/constants/StateConstants';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  UNMOUNT_EXPLORE,
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
  IS_LOADING_ENTITY_NEIGHBORS,
  IS_SEARCHING_DATA,
  SEARCH_RESULTS,
} = EXPLORE;

const INITIAL_STATE :Map<> = fromJS({
  [BREADCRUMBS]: List(),
  [ENTITY_NEIGHBORS_BY_ID]: Map(),
  [ENTITIES_BY_ID]: Map(),
  [IS_LOADING_ENTITY_NEIGHBORS]: false,
  [IS_SEARCHING_DATA]: false,
  [SEARCH_RESULTS]: List()
});

const updateEntitiesIdForNeighbors = (initEntitiesById, neighborList) => {
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
      entitiesById = entitiesById.set(
        neighborEntityKeyId,
        entitiesById.get(neighborEntityKeyId, Map()).merge(neighbor)
      );
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
          const { entity, neighbors } = action.value;
          const neighborList = fromJS(neighbors);
          const entityKeyId = getEntityKeyId(entity);

          const entitiesById = updateEntitiesIdForNeighbors(state.get(ENTITIES_BY_ID), neighborList);

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
              entitiesById.get(entityKeyId, Map()).merge(entity)
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
            entitiesById = updateEntitiesIdForNeighbors(entitiesById, neighborList);
          });
          return state.set(ENTITY_NEIGHBORS_BY_ID, neighborsById).set(ENTITIES_BY_ID, entitiesById);
        }
      });
    }

    case searchEntitySetData.case(action.type): {
      return searchEntitySetData.reducer(state, action, {
        REQUEST: () => state.set(IS_SEARCHING_DATA, true).set(SEARCH_RESULTS, List()),
        SUCCESS: () => {
          const results = fromJS(action.value);
          let entitiesById = state.get(ENTITIES_BY_ID);
          results.get('hits', List()).forEach((result) => {
            entitiesById = entitiesById.set(getEntityKeyId(result), result);
          });
          return state.set(SEARCH_RESULTS, results).set(ENTITIES_BY_ID, entitiesById);
        },
        FAILURE: () => state.set(SEARCH_RESULTS, List()),
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

    case CLEAR_EXPLORE_SEARCH_RESULTS:
    case CLEAR_TOP_UTILIZERS_RESULTS:
    case UNMOUNT_TOP_UTILIZERS:
    case UNMOUNT_EXPLORE:
      return state.set(BREADCRUMBS, List())
        .set(IS_LOADING_ENTITY_NEIGHBORS, false)
        .set(IS_SEARCHING_DATA, false)
        .set(SEARCH_RESULTS, List());

    default:
      return state;
  }
}

export default reducer;
