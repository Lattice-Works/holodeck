/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import {
  CLEAR_TOP_UTILIZERS,
  getNeighborTypes,
  getTopUtilizers
} from './TopUtilizersActionFactory';

const {
  IS_LOADING_NEIGHBOR_TYPES,
  IS_LOADING_TOP_UTILIZERS,
  NEIGHBOR_TYPES,
  QUERY_HAS_RUN,
  TOP_UTILIZER_RESULTS
} = TOP_UTILIZERS;

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_TOP_UTILIZERS]: false,
  [IS_LOADING_NEIGHBOR_TYPES]: false,
  [NEIGHBOR_TYPES]: List(),
  [QUERY_HAS_RUN]: false,
  [TOP_UTILIZER_RESULTS]: List()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case getNeighborTypes.case(action.type): {
      return getNeighborTypes.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_NEIGHBOR_TYPES, true).set(NEIGHBOR_TYPES, List()),
        SUCCESS: () => state.set(NEIGHBOR_TYPES, fromJS(action.value)),
        FAILURE: () => state.set(NEIGHBOR_TYPES, List()),
        FINALLY: () => state.set(IS_LOADING_NEIGHBOR_TYPES, false)
      });
    }

    case getTopUtilizers.case(action.type): {
      return getTopUtilizers.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_TOP_UTILIZERS, true).set(TOP_UTILIZER_RESULTS, List()),
        SUCCESS: () => state.set(TOP_UTILIZER_RESULTS, fromJS(action.value)),
        FAILURE: () => state.set(TOP_UTILIZER_RESULTS, List()),
        FINALLY: () => state.set(IS_LOADING_TOP_UTILIZERS, false).set(QUERY_HAS_RUN, true)
      });
    }

    case CLEAR_TOP_UTILIZERS:
      return state
        .set(QUERY_HAS_RUN, false)
        .set(TOP_UTILIZER_RESULTS, List());

    default:
      return state;
  }
}

export default reducer;
