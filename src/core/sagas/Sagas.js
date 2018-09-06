/*
 * @flow
 */

import { AuthSagas } from 'lattice-auth';
import { fork } from 'redux-saga/effects';

import * as EdmSagas from '../../containers/edm/EdmSagas';
import * as EntitySetSagas from '../../containers/entitysets/EntitySetSagas';
import * as ExploreSagas from '../../containers/explore/ExploreSagas';
import * as TopUtilizersSagas from '../../containers/toputilizers/TopUtilizersSagas';

export default function* sagas() :Generator<*, *, *> {

  yield [
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    /* EdmSagas */
    fork(EdmSagas.loadEdmWatcher),

    /* EntitySetSagas */
    fork(EntitySetSagas.searchEntitySetsWatcher),
    fork(EntitySetSagas.selectEntitySetWatcher),

    /* ExploreSagas */
    fork(ExploreSagas.loadEntityNeighborsWatcher),

    /* TopUtilizersSagas */
    fork(TopUtilizersSagas.getNeighborTypesWatcher),
    fork(TopUtilizersSagas.getTopUtilizersWatcher)
  ];
}
