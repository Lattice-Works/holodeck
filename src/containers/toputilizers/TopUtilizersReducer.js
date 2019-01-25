/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';
import {
  CHANGE_NUM_UTILIZERS,
  CHANGE_TOP_UTILIZERS_DISPLAY,
  CLEAR_TOP_UTILIZERS_RESULTS,
  UNMOUNT_TOP_UTILIZERS,
  downloadTopUtilizers,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors
} from './TopUtilizersActionFactory';

import { UPDATE_FILTERED_TYPES } from '../explore/ExploreActionFactory';

const DEFAULT_NUM_RESULTS = 100;

const {
  COUNT_BREAKDOWN,
  IS_DOWNLOADING_TOP_UTILIZERS,
  IS_LOADING_NEIGHBOR_TYPES,
  IS_LOADING_TOP_UTILIZERS,
  IS_LOADING_TOP_UTILIZER_NEIGHBORS,
  LAST_QUERY_RUN,
  NEIGHBOR_TYPES,
  NUMBER_OF_UTILIZERS,
  QUERY_HAS_RUN,
  RESULT_DISPLAY,
  TOP_UTILIZER_FILTERS,
  TOP_UTILIZER_RESULTS,
  UNFILTERED_TOP_UTILIZER_RESULTS
} = TOP_UTILIZERS;

const INITIAL_STATE :Map<> = fromJS({
  [COUNT_BREAKDOWN]: Map(),
  [IS_DOWNLOADING_TOP_UTILIZERS]: false,
  [IS_LOADING_TOP_UTILIZERS]: false,
  [IS_LOADING_NEIGHBOR_TYPES]: false,
  [IS_LOADING_TOP_UTILIZER_NEIGHBORS]: false,
  [LAST_QUERY_RUN]: '',
  [NEIGHBOR_TYPES]: List(),
  [NUMBER_OF_UTILIZERS]: DEFAULT_NUM_RESULTS,
  [QUERY_HAS_RUN]: false,
  [RESULT_DISPLAY]: RESULT_DISPLAYS.SEARCH_RESULTS,
  [TOP_UTILIZER_FILTERS]: List(),
  [TOP_UTILIZER_RESULTS]: List(),
  [UNFILTERED_TOP_UTILIZER_RESULTS]: List()
});

const filterEntity = (entity, filteredTypes) => {
  let filteredEntity = entity;

  filteredTypes.forEach((fqn) => {
    filteredEntity = filteredEntity.delete(fqn);
  });

  return filteredEntity;
};

const filterResults = (searchResults, filteredTypes) => searchResults
  .map(entity => filterEntity(entity, filteredTypes));

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case downloadTopUtilizers.case(action.type): {
      return downloadTopUtilizers.reducer(state, action, {
        REQUEST: () => state.set(IS_DOWNLOADING_TOP_UTILIZERS, true),
        FINALLY: () => state.set(IS_DOWNLOADING_TOP_UTILIZERS, false)
      });
    }

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
          .set(UNFILTERED_TOP_UTILIZER_RESULTS, List())
          .set(COUNT_BREAKDOWN, Map())
          .set(TOP_UTILIZER_FILTERS, fromJS(action.value.eventFilters)),
        SUCCESS: () => state
          .set(UNFILTERED_TOP_UTILIZER_RESULTS, fromJS(action.value.topUtilizers))
          .set(TOP_UTILIZER_RESULTS, filterResults(
            fromJS(action.value.topUtilizers),
            action.value.filteredPropertyTypes
          ))
          .set(COUNT_BREAKDOWN, action.value.scoresByUtilizer)
          .set(LAST_QUERY_RUN, action.value.query),
        FAILURE: () => state
          .set(TOP_UTILIZER_RESULTS, List())
          .set(UNFILTERED_TOP_UTILIZER_RESULTS, List())
          .set(COUNT_BREAKDOWN, Map()),
        FINALLY: () => state.set(IS_LOADING_TOP_UTILIZERS, false).set(QUERY_HAS_RUN, true)
      });
    }

    case loadTopUtilizerNeighbors.case(action.type): {
      return loadTopUtilizerNeighbors.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_TOP_UTILIZER_NEIGHBORS, true),
        FINALLY: () => state.set(IS_LOADING_TOP_UTILIZER_NEIGHBORS, false)
      });
    }

    case CHANGE_NUM_UTILIZERS:
      return state.set(NUMBER_OF_UTILIZERS, action.value);

    case CHANGE_TOP_UTILIZERS_DISPLAY:
      return state.set(RESULT_DISPLAY, action.value);

    case UPDATE_FILTERED_TYPES:
      return state.set(TOP_UTILIZER_RESULTS, filterResults(state.get(UNFILTERED_TOP_UTILIZER_RESULTS), action.value));

    case CLEAR_TOP_UTILIZERS_RESULTS:
    case UNMOUNT_TOP_UTILIZERS:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default reducer;
