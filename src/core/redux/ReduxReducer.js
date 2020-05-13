/*
 * @flow
 */

import { connectRouter } from 'connected-react-router/immutable';
import { AuthReducer } from 'lattice-auth';
import { combineReducers } from 'redux-immutable';

import { REDUCERS } from './constants';

import { AppReducer } from '../../containers/app';
import { EntitySetReducer } from '../../containers/entityset';
import { EDMReducer } from '../edm';
import { SearchReducer } from '../search';

const {
  APP,
  EDM,
  ENTITY_SET,
  SEARCH,
} = REDUCERS;

export default function reduxReducer(routerHistory :any) {

  return combineReducers({
    [APP]: AppReducer,
    [EDM]: EDMReducer,
    [ENTITY_SET]: EntitySetReducer,
    [SEARCH]: SearchReducer,
    auth: AuthReducer,
    router: connectRouter(routerHistory),
  });
}
