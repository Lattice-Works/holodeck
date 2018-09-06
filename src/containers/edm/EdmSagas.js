/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { all, call, put, takeEvery } from 'redux-saga/effects';

import {
  LOAD_EDM,
  loadEdm
} from './EdmActionFactory';

function* loadEdmWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadEdm.request(action.id));

    const [propertyTypes, entityTypes] = yield all([
      call(EntityDataModelApi.getAllPropertyTypes),
      call(EntityDataModelApi.getAllEntityTypes)
    ]);

    yield put(loadEdm.success(action.id, {
      propertyTypes,
      entityTypes
    }));
  }
  catch (error) {
    console.error(error);
    yield put(loadEdm.failure(action.id, error));
  }
  finally {
    yield put(loadEdm.finally(action.id));
  }
}

export function* loadEdmWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_EDM, loadEdmWorker);
}
