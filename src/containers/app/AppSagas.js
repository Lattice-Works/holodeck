/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import { OrganizationsApiActions, OrganizationsApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { SequenceAction } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';

import { getEntityDataModelTypes } from '../../core/edm/EDMActions';
import { getEntityDataModelTypesWorker } from '../../core/edm/EDMSagas';

const LOG = new Logger('AppSagas');

const { getAllOrganizations } = OrganizationsApiActions;
const { getAllOrganizationsWorker } = OrganizationsApiSagas;

/*
 *
 * AppActions.initializeApplication
 *
 */

function* initializeApplicationWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(initializeApplication.request(action.id));
    const responses :Object[] = yield all([
      call(getEntityDataModelTypesWorker, getEntityDataModelTypes()),
      call(getAllOrganizationsWorker, getAllOrganizations()),
    ]);
    if (responses[0].error) throw responses[0].error;
    yield put(initializeApplication.success(action.id));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(initializeApplication.failure(action.id, error));
  }
  finally {
    yield put(initializeApplication.finally(action.id));
  }
}

function* initializeApplicationWatcher() :Saga<*> {

  yield takeEvery(INITIALIZE_APPLICATION, initializeApplicationWorker);
}

export {
  initializeApplicationWatcher,
  initializeApplicationWorker,
};
