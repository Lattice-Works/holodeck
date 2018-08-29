/*
 * @flow
 */

import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import EntitySetReducer from '../../containers/entitysets/EntitySetReducer';
import TopUtilizersReducer from '../../containers/toputilizers/TopUtilizersReducer';

import { STATE } from '../../utils/constants/StateConstants';

export default function reduxReducer() {

  return combineReducers({
    auth: AuthReducer,
    [STATE.ENTITY_SETS]: EntitySetReducer,
    [STATE.TOP_UTILIZERS]: TopUtilizersReducer
  });
}
