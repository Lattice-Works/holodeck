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

    const [propertyTypes, entityTypes, entitySets] = yield all([
      call(EntityDataModelApi.getAllPropertyTypes),
      call(EntityDataModelApi.getAllEntityTypes),
      call(EntityDataModelApi.getAllEntitySets)
    ]);

    const entitySetMetadata = yield call(
      EntityDataModelApi.getPropertyMetadataForEntitySets,
      entitySets.map(es => es.id)
    );

    yield put(loadEdm.success(action.id, {
      propertyTypes,
      entityTypes,
      entitySets,
      entitySetMetadata
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
