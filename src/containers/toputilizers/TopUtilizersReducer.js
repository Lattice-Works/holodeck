/*
 * @flow
 */

import Immutable from 'immutable';

import { TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import {
  getNeighborTypes,
  getTopUtilizers
} from './TopUtilizersActionFactory';

const {
  IS_LOADING_NEIGHBOR_TYPES,
  IS_LOADING_TOP_UTILIZERS,
  NEIGHBOR_TYPES,
  TOP_UTILIZER_RESULTS
} = TOP_UTILIZERS;

const INITIAL_STATE :Immutable.Map<> = Immutable.fromJS({
  [IS_LOADING_TOP_UTILIZERS]: false,
  [IS_LOADING_NEIGHBOR_TYPES]: false,
  [NEIGHBOR_TYPES]: Immutable.List(),
  [TOP_UTILIZER_RESULTS]: Immutable.List()
});

function reducer(state :Immutable.Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case getNeighborTypes.case(action.type): {
      return getNeighborTypes.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_NEIGHBOR_TYPES, true).set(NEIGHBOR_TYPES, Immutable.List()),
        SUCCESS: () => state.set(NEIGHBOR_TYPES, Immutable.fromJS(action.value)),
        FAILURE: () => state.set(NEIGHBOR_TYPES, Immutable.List()),
        FINALLY: () => state.set(IS_LOADING_NEIGHBOR_TYPES, false)
      });
    }

    case getTopUtilizers.case(action.type): {
      return getTopUtilizers.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_TOP_UTILIZERS, true).set(TOP_UTILIZER_RESULTS, Immutable.List()),
        SUCCESS: () => state.set(TOP_UTILIZER_RESULTS, Immutable.fromJS(action.value)),
        FAILURE: () => state.set(TOP_UTILIZER_RESULTS, Immutable.List()),
        FINALLY: () => state.set(IS_LOADING_TOP_UTILIZERS, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
