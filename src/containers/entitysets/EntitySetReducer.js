/*
 * @flow
 */

import Immutable from 'immutable';

import { ENTITY_SETS } from '../../utils/constants/StateConstants';
import {
  searchEntitySets,
  selectEntitySet
} from './EntitySetActionFactory';

const {
  ENTITY_SET_SEARCH_RESULTS,
  IS_LOADING_ENTITY_SETS,
  IS_PERSON_TYPE,
  SELECTED_ENTITY_SET,
  SELECTED_ENTITY_SET_PROPERTY_TYPES
} = ENTITY_SETS;

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  [IS_LOADING_ENTITY_SETS]: false,
  [IS_PERSON_TYPE]: false,
  [ENTITY_SET_SEARCH_RESULTS]: Immutable.List(),
  [SELECTED_ENTITY_SET]: undefined,
  [SELECTED_ENTITY_SET_PROPERTY_TYPES]: Immutable.List()
});

function reducer(state :Immutable.Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case searchEntitySets.case(action.type): {
      return searchEntitySets.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_ENTITY_SETS, true).set(ENTITY_SET_SEARCH_RESULTS, Immutable.List()),
        SUCCESS: () => state.set(ENTITY_SET_SEARCH_RESULTS, Immutable.fromJS(action.value.hits)),
        FAILURE: () => state.set(ENTITY_SET_SEARCH_RESULTS, Immutable.List()),
        FINALLY: () => state.set(IS_LOADING_ENTITY_SETS, false)
      });
    }

    case selectEntitySet.case(action.type): {
      return selectEntitySet.reducer(state, action, {
        REQUEST: () => state
          .set(SELECTED_ENTITY_SET, action.value.entitySet)
          .set(SELECTED_ENTITY_SET_PROPERTY_TYPES, action.value.propertyTypes)
          .set(IS_PERSON_TYPE, false),
        SUCCESS: () => state.set(IS_PERSON_TYPE, action.value)
      });
    }

    default:
      return state;
  }
}

export default reducer;
