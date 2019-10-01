/*
 * @flow
 */

import Immutable from 'immutable';
import createSagaMiddleware from '@redux-saga/core';
import { routerMiddleware } from 'connected-react-router/immutable';
import { applyMiddleware, compose, createStore } from 'redux';

import sagas from '../sagas/Sagas';
import reduxReducer from './ReduxReducer';
import trackingHandlers from '../tracking/google/trackinghandlers';
import trackingMiddleware from '../tracking/TrackingMiddleware';

export default function initializeReduxStore(routerHistory :any) :Object {

  const sagaMiddleware = createSagaMiddleware();

  const reduxMiddlewares = [
    sagaMiddleware,
    routerMiddleware(routerHistory),
    trackingMiddleware(trackingHandlers),
  ];

  const reduxEnhancers = [
    applyMiddleware(...reduxMiddlewares)
  ];

  const stateSanitizer = (state) => state
    .set('EDM', 'SANITIZED: remove stateSanitizer from enhancers to view.')
    .set('ENTITY_SETS', 'SANITIZED: remove stateSanitizer from enhancers to view.');

  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      stateSanitizer,
      maxAge: 100
    })
    : compose;
  /* eslint-enable */

  const reduxStore = createStore(
    reduxReducer(routerHistory),
    Immutable.Map(),
    composeEnhancers(...reduxEnhancers)
  );

  sagaMiddleware.run(sagas);

  return reduxStore;
}
