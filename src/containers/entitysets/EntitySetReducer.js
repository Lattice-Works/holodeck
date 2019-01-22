/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { ENTITY_SETS } from '../../utils/constants/StateConstants';
import {
  SELECT_ENTITY_SET,
  SELECT_ENTITY_SET_PAGE,
  SET_SHOW_ASSOCIATION_ENTITY_SETS,
  loadEntitySetSizes,
  searchEntitySets,
  selectEntitySetById
} from './EntitySetActionFactory';

import { UNMOUNT_EXPLORE } from '../explore/ExploreActionFactory';
import { UNMOUNT_TOP_UTILIZERS } from '../toputilizers/TopUtilizersActionFactory';

const {
  ENTITY_SET_SEARCH_RESULTS,
  ENTITY_SET_SIZES,
  IS_LOADING_ENTITY_SETS,
  SELECTED_ENTITY_SET,
  SHOW_ASSOCIATION_ENTITY_SETS,
  PAGE,
  TOTAL_HITS
} = ENTITY_SETS;

const INITIAL_STATE :Map<> = fromJS({
  [IS_LOADING_ENTITY_SETS]: false,
  [ENTITY_SET_SEARCH_RESULTS]: List(),
  [ENTITY_SET_SIZES]: Map(),
  [SELECTED_ENTITY_SET]: undefined,
  [SHOW_ASSOCIATION_ENTITY_SETS]: false,
  [PAGE]: 1,
  [TOTAL_HITS]: 0
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case searchEntitySets.case(action.type): {
      return searchEntitySets.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ENTITY_SETS, true).set(ENTITY_SET_SEARCH_RESULTS, List()),
        SUCCESS: () => state
          .set(ENTITY_SET_SEARCH_RESULTS, fromJS(action.value.hits))
          .set(TOTAL_HITS, action.value.numHits),
        FAILURE: () => state
          .set(ENTITY_SET_SEARCH_RESULTS, List())
          .set(TOTAL_HITS, 0),
        FINALLY: () => state.set(IS_LOADING_ENTITY_SETS, false)
      });
    }

    case loadEntitySetSizes.case(action.type): {
      return loadEntitySetSizes.reducer(state, action, {
        SUCCESS: () => state.set(ENTITY_SET_SIZES, state.get(ENTITY_SET_SIZES).merge(fromJS(action.value))),
      });
    }

    case selectEntitySetById.case(action.type): {
      return selectEntitySetById.reducer(state, action, {
        SUCCESS: () => state.set(SELECTED_ENTITY_SET, fromJS(action.value))
      });
    }

    case SELECT_ENTITY_SET:
      return state.set(SELECTED_ENTITY_SET, action.value);

    case SELECT_ENTITY_SET_PAGE:
      return state.set(PAGE, action.value);

    case SET_SHOW_ASSOCIATION_ENTITY_SETS:
      return state.set(SHOW_ASSOCIATION_ENTITY_SETS, action.value);

    case UNMOUNT_EXPLORE:
    case UNMOUNT_TOP_UTILIZERS:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default reducer;
