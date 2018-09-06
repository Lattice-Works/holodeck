/*
 * @flow
 */

import { EntityDataModelApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  LOAD_PROPERTY_TYPES,
  loadPropertyTypes
} from './EdmActionFactory';

function* loadPropertyTypesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadPropertyTypes.request(action.id));

    const propertyTypes = yield call(EntityDataModelApi.getAllPropertyTypes);
    yield put(loadPropertyTypes.success(action.id, propertyTypes));
  }
  catch (error) {
    console.error(error);
    yield put(loadPropertyTypes.failure(action.id, error));
  }
  finally {
    yield put(loadPropertyTypes.finally(action.id));
  }
}

export function* loadPropertyTypesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_PROPERTY_TYPES, loadPropertyTypesWorker);
}
