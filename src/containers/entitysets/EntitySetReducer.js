/*
 * @flow
 */

import Immutable from 'immutable';

import { ENTITY_SETS } from '../../utils/constants/StateConstants';
import {
  SELECT_ENTITY_SET,
  SELECT_ENTITY_SET_PAGE,
  searchEntitySets
} from './EntitySetActionFactory';

import { UNMOUNT_EXPLORE } from '../explore/ExploreActionFactory';
import { UNMOUNT_TOP_UTILIZERS } from '../toputilizers/TopUtilizersActionFactory';

const {
  ENTITY_SET_SEARCH_RESULTS,
  IS_LOADING_ENTITY_SETS,
  SELECTED_ENTITY_SET,
  PAGE,
  TOTAL_HITS
} = ENTITY_SETS;

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  [IS_LOADING_ENTITY_SETS]: false,
  [ENTITY_SET_SEARCH_RESULTS]: Immutable.List(),
  [SELECTED_ENTITY_SET]: undefined,
  [PAGE]: 1,
  [TOTAL_HITS]: 0
});

function reducer(state :Immutable.Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case searchEntitySets.case(action.type): {
      return searchEntitySets.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ENTITY_SETS, true).set(ENTITY_SET_SEARCH_RESULTS, Immutable.List()),
        SUCCESS: () => state
          .set(ENTITY_SET_SEARCH_RESULTS, Immutable.fromJS(action.value.hits))
          .set(TOTAL_HITS, action.value.numHits),
        FAILURE: () => state
          .set(ENTITY_SET_SEARCH_RESULTS, Immutable.List())
          .set(TOTAL_HITS, 0),
        FINALLY: () => state.set(IS_LOADING_ENTITY_SETS, false)
      });
    }

    case SELECT_ENTITY_SET:
      return state.set(SELECTED_ENTITY_SET, action.value);

    case SELECT_ENTITY_SET_PAGE:
      return state.set(PAGE, action.value);

    case UNMOUNT_EXPLORE:
    case UNMOUNT_TOP_UTILIZERS:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default reducer;
