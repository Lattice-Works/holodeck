/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import EntitySetReducer from '../../containers/entitysets/EntitySetReducer';
import ExploreReducer from '../../containers/explore/ExploreReducer';
import TopUtilizersReducer from '../../containers/toputilizers/TopUtilizersReducer';

import { STATE } from '../../utils/constants/StateConstants';

export default function reduxReducer() {

  return combineReducers({
    auth: AuthReducer,
    [STATE.ENTITY_SETS]: EntitySetReducer,
    [STATE.EXPLORE]: ExploreReducer,
    [STATE.TOP_UTILIZERS]: TopUtilizersReducer
  });
}
