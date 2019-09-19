/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import {
  DataApiSagas,
  EntityDataModelApiSagas,
  EntitySetsApiSagas,
  SearchApiSagas,
} from 'lattice-sagas';

import * as AppSagas from '../../containers/app/AppSagas';
import * as EntitySetSagas from '../../containers/entitysets/EntitySetSagas';
import * as ExploreSagas from '../../containers/explore/ExploreSagas';
import * as RoutingSagas from '../router/RoutingSagas';
import * as TopUtilizersSagas from '../../containers/toputilizers/TopUtilizersSagas';

import { EDMSagas } from '../edm';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(DataApiSagas.getEntitySetSizeWatcher),
    fork(EntityDataModelApiSagas.getAllEntityTypesWatcher),
    fork(EntityDataModelApiSagas.getAllPropertyTypesWatcher),
    fork(EntitySetsApiSagas.getAllEntitySetsWatcher),
    fork(EntitySetsApiSagas.getEntitySetWatcher),
    fork(EntitySetsApiSagas.getPropertyTypeMetaDataForEntitySetsWatcher),
    fork(SearchApiSagas.searchEntitySetMetaDataWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),
    fork(EDMSagas.getEntitySetsWithMetaDataWatcher),

    /* EntitySetSagas */
    fork(EntitySetSagas.loadEntitySetSizesWatcher),
    fork(EntitySetSagas.searchEntitySetsWatcher),
    fork(EntitySetSagas.selectEntitySetByIdWatcher),

    /* ExploreSagas */
    fork(ExploreSagas.loadEntityNeighborsWatcher),
    fork(ExploreSagas.searchEntitySetDataWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    /* TopUtilizersSagas */
    fork(TopUtilizersSagas.downloadTopUtilizersWatcher),
    fork(TopUtilizersSagas.getNeighborTypesWatcher),
    fork(TopUtilizersSagas.getTopUtilizersWatcher),
    fork(TopUtilizersSagas.loadTopUtilizerNeighborsWatcher),
  ]);
}
