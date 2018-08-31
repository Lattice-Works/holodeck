/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { fork } from 'redux-saga/effects';

import * as EntitySetSagas from '../../containers/entitysets/EntitySetSagas';
import * as TopUtilizersSagas from '../../containers/toputilizers/TopUtilizersSagas';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    /* EntitySetSagas */
    fork(EntitySetSagas.searchEntitySetsWatcher),

    /* TopUtilizersSagas */
    fork(TopUtilizersSagas.getNeighborTypesWatcher),
    fork(TopUtilizersSagas.getTopUtilizersWatcher)
  ];
}
