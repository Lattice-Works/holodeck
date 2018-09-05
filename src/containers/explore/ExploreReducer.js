/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { EXPLORE } from '../../utils/constants/StateConstants';
import {
  loadEntityNeighbors
} from './ExploreActionFactory';

const {
  SELECTED_ENTITY_KEY_ID,
  IS_LOADING_ENTITY_NEIGHBORS,
  ENTITY_NEIGHBORS_BY_ID
} = EXPLORE;

const INITIAL_STATE :Map<> = fromJS({
  [SELECTED_ENTITY_KEY_ID]: undefined,
  [IS_LOADING_ENTITY_NEIGHBORS]: false,
  [ENTITY_NEIGHBORS_BY_ID]: Map()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadEntityNeighbors.case(action.type): {
      return loadEntityNeighbors.reducer(state, action, {
        REQUEST: () => state
          .set(IS_LOADING_ENTITY_NEIGHBORS, true)
          .set(SELECTED_ENTITY_KEY_ID, action.value.entityKeyId)
          .setIn([ENTITY_NEIGHBORS_BY_ID, action.value.entityKeyId], List()),
        SUCCESS: () => state.setIn([ENTITY_NEIGHBORS_BY_ID, action.value.entityKeyId], fromJS(action.value.neighbors)),
        FAILURE: () => state.setIn([ENTITY_NEIGHBORS_BY_ID, action.value.entityKeyId], List()),
        FINALLY: () => state.set(IS_LOADING_ENTITY_NEIGHBORS, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
