/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import getTitle from '../../utils/EntityTitleUtils';
import { EXPLORE } from '../../utils/constants/StateConstants';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import {
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  loadEntityNeighbors,
  selectEntity
} from './ExploreActionFactory';

import { getTopUtilizers, loadTopUtilizerNeighbors } from '../toputilizers/TopUtilizersActionFactory';

const {
  IS_LOADING_ENTITY_NEIGHBORS,
  ENTITY_NEIGHBORS_BY_ID,
  ENTITIES_BY_ID,
  BREADCRUMBS
} = EXPLORE;

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_ENTITY_NEIGHBORS]: false,
  [ENTITY_NEIGHBORS_BY_ID]: Map(),
  [ENTITIES_BY_ID]: Map(),
  [BREADCRUMBS]: List()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadEntityNeighbors.case(action.type): {
      return loadEntityNeighbors.reducer(state, action, {
        REQUEST: () => state
          .set(IS_LOADING_ENTITY_NEIGHBORS, true)
          .setIn([ENTITY_NEIGHBORS_BY_ID, getEntityKeyId(action.value.entity)], List()),
        SUCCESS: () => {
          const { entity, neighbors } = action.value;
          const neighborList = fromJS(neighbors);
          const entityKeyId = getEntityKeyId(entity);

          let entitiesById = state.get(ENTITIES_BY_ID);
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
        SUCCESS: () => state
          .set(ENTITY_NEIGHBORS_BY_ID, state.get(ENTITY_NEIGHBORS_BY_ID).merge(fromJS(action.value.neighborsById)))
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

    default:
      return state;
  }
}

export default reducer;
