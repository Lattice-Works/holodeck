/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import { REDUCERS } from './constants';

import { AppReducer } from '../../containers/app';
import { ExploreReducer } from '../../containers/explore';
import { OrgsReducer } from '../../containers/orgs';
import { DataReducer } from '../data';
import { EDMReducer } from '../edm';
import { SearchReducer } from '../search';

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [REDUCERS.APP]: AppReducer,
    [REDUCERS.DATA]: DataReducer,
    [REDUCERS.EDM]: EDMReducer,
    [REDUCERS.EXPLORE]: ExploreReducer,
    [REDUCERS.ORGS]: OrgsReducer,
    [REDUCERS.SEARCH]: SearchReducer,
    auth: AuthReducer,
    router: connectRouter(routerHistory),
  });
}
