/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';
import {
  CHANGE_TOP_UTILIZERS_DISPLAY,
  CLEAR_TOP_UTILIZERS,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors
} from './TopUtilizersActionFactory';

const {
  IS_LOADING_NEIGHBOR_TYPES,
  IS_LOADING_TOP_UTILIZERS,
  IS_LOADING_TOP_UTILIZER_NEIGHBORS,
  NEIGHBOR_TYPES,
  QUERY_HAS_RUN,
  RESULT_DISPLAY,
  TOP_UTILIZER_FILTERS,
  TOP_UTILIZER_NEIGHBOR_DETAILS,
  TOP_UTILIZER_RESULTS
} = TOP_UTILIZERS;

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_TOP_UTILIZERS]: false,
  [IS_LOADING_NEIGHBOR_TYPES]: false,
  [IS_LOADING_TOP_UTILIZER_NEIGHBORS]: false,
  [NEIGHBOR_TYPES]: List(),
  [QUERY_HAS_RUN]: false,
  [RESULT_DISPLAY]: RESULT_DISPLAYS.SEARCH_RESULTS,
  [TOP_UTILIZER_FILTERS]: List(),
  [TOP_UTILIZER_NEIGHBOR_DETAILS]: Map(),
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
        REQUEST: () => state
          .set(IS_LOADING_TOP_UTILIZERS, true)
          .set(TOP_UTILIZER_RESULTS, List())
          .set(TOP_UTILIZER_FILTERS, fromJS(action.value)),
        SUCCESS: () => state.set(TOP_UTILIZER_RESULTS, fromJS(action.value)),
        FAILURE: () => state.set(TOP_UTILIZER_RESULTS, List()),
        FINALLY: () => state.set(IS_LOADING_TOP_UTILIZERS, false).set(QUERY_HAS_RUN, true)
      });
    }

    case loadTopUtilizerNeighbors.case(action.type): {
      return loadTopUtilizerNeighbors.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_TOP_UTILIZER_NEIGHBORS, true),
        SUCCESS: () => state.set(TOP_UTILIZER_NEIGHBOR_DETAILS, action.value.neighborCounts),
        FAILURE: () => state.set(TOP_UTILIZER_NEIGHBOR_DETAILS, Map()),
        FINALLY: () => state.set(IS_LOADING_TOP_UTILIZER_NEIGHBORS, false)
      });
    }

    case CHANGE_TOP_UTILIZERS_DISPLAY:
      return state.set(RESULT_DISPLAY, action.value);

    case CLEAR_TOP_UTILIZERS:
      return state
        .set(QUERY_HAS_RUN, false)
        .set(TOP_UTILIZER_RESULTS, List())
        .set(TOP_UTILIZER_FILTERS, List())
        .set(TOP_UTILIZER_NEIGHBOR_DETAILS, Map());

    default:
      return state;
  }
}

export default reducer;
