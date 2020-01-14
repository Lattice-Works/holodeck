/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import EntitySetReducer from '../../containers/entitysets/EntitySetReducer';
import ExploreReducer from '../../containers/explore/ExploreReducer';
import TopUtilizersReducer from '../../containers/toputilizers/TopUtilizersReducer';

import { AppReducer } from '../../containers/app';
import { LinkingReducer } from '../../containers/linking';
import { EDMReducer } from '../edm';
import { STATE } from '../../utils/constants/StateConstants';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    app: AppReducer,
    auth: AuthReducer,
    edm: EDMReducer,
    linking: LinkingReducer,
    router: connectRouter(routerHistory),
    [STATE.ENTITY_SETS]: EntitySetReducer,
    [STATE.EXPLORE]: ExploreReducer,
    [STATE.TOP_UTILIZERS]: TopUtilizersReducer
  });
}
