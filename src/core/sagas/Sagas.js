/*
 * @flow
 */

import { all, fork } from '@redux-saga/core/effects';
import { AuthSagas } from 'lattice-auth';
import {
  DataApiSagas,
  DataSetsApiSagas,
  EntitySetsApiSagas,
  OrganizationsApiSagas,
} from 'lattice-sagas';

import { AppSagas } from '../../containers/app';
import { ExploreSagas } from '../../containers/explore';
import { DataSagas } from '../data';
import { EDMSagas } from '../edm';
import { RoutingSagas } from '../router';
import { SearchSagas } from '../search';

export default function* sagas() :Generator<*, *, *> {

  yield all([
    // "lattice-auth" sagas
    fork(AuthSagas.watchAuthAttempt),
    fork(AuthSagas.watchAuthSuccess),
    fork(AuthSagas.watchAuthFailure),
    fork(AuthSagas.watchAuthExpired),
    fork(AuthSagas.watchLogout),

    // "lattice-sagas" sagas
    fork(DataApiSagas.getEntityDataWatcher),
    fork(DataApiSagas.getEntitySetDataWatcher),
    fork(DataSetsApiSagas.getOrganizationDataSetDataWatcher),
    fork(DataSetsApiSagas.getOrganizationDataSetsWithColumnsWatcher),
    fork(EntitySetsApiSagas.getEntitySetWatcher),
    fork(OrganizationsApiSagas.getOrganizationWatcher),

    // AppSagas
    fork(AppSagas.initializeApplicationWatcher),

    // DataSagas
    fork(DataSagas.fetchEntitySetDataWatcher),

    // EDMSagas
    fork(EDMSagas.getEntityDataModelTypesWatcher),

    // ExploreSagas
    fork(ExploreSagas.exploreAtlasDataSetWatcher),
    fork(ExploreSagas.exploreEntityDataWatcher),
    fork(ExploreSagas.exploreEntityNeighborsWatcher),
    fork(ExploreSagas.exploreEntitySetWatcher),
    fork(ExploreSagas.exploreOrganizationWatcher),

    // RoutingSagas
    fork(RoutingSagas.goToRootWatcher),
    fork(RoutingSagas.goToRouteWatcher),

    // SearchSagas
    fork(SearchSagas.searchEntitySetWatcher),
    fork(SearchSagas.searchEntitySetsWatcher),
  ]);
}
