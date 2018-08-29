/*
 * @flow
 */

import Immutable from 'immutable';

import { ENTITY_SETS } from '../../utils/constants/StateConstants';
import {
  searchEntitySets
} from './EntitySetActionFactory';

const {
  ENTITY_SET_SEARCH_RESULTS,
  IS_LOADING_ENTITY_SETS
} = ENTITY_SETS;

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  [IS_LOADING_ENTITY_SETS]: false,
  [ENTITY_SET_SEARCH_RESULTS]: Immutable.List()
});

function reducer(state :Immutable.Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case searchEntitySets.case(action.type): {
      return searchEntitySets.reducer(state, action, {
        REQUEST: state.set(IS_LOADING_ENTITY_SETS, true).set(ENTITY_SET_SEARCH_RESULTS, Immutable.List()),
        SUCCESS: state.set(ENTITY_SET_SEARCH_RESULTS, Immutable.fromJS(action.value)),
        FAILURE: state.set(ENTITY_SET_SEARCH_RESULTS, Immutable.List()),
        FINALLY: state.set(IS_LOADING_ENTITY_SETS, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
