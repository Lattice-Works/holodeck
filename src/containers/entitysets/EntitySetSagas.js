/*
 * @flow
 */

import { DataApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET,
  searchEntitySets,
  selectEntitySet
} from './EntitySetActionFactory';

function* searchEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchEntitySets.request(action.id));
    const results = yield call(SearchApi.searchEntitySetMetaData, action.value);
    yield put(searchEntitySets.success(action.id, results));
  }
  catch (error) {
    console.error(error);
    yield put(searchEntitySets.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySets.finally(action.id));
  }
}

export function* searchEntitySetsWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_ENTITY_SETS, searchEntitySetsWorker);
}

function* selectEntitySetWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const entitySet = action.value;
    yield put(selectEntitySet.request(action.id, { entitySet }));

    const entitySetSize = yield call(DataApi.getEntitySetSize, entitySet.get('id'));
    yield put(selectEntitySet.success(action.id, { entitySetSize }));
  }
  catch (error) {
    yield put(selectEntitySet.failure(action.id, error));
  }
  finally {
    yield put(selectEntitySet.finally(action.id));
  }
}

export function* selectEntitySetWatcher() :Generator<*, *, *> {
  yield takeEvery(SELECT_ENTITY_SET, selectEntitySetWorker);
}
