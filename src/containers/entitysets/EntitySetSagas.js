/*
 * @flow
 */

import { DataApi, SearchApi } from 'lattice';
import {
  all,
  call,
  put,
  takeEvery
} from 'redux-saga/effects';

import {
  LOAD_ENTITY_SET_SIZES,
  SEARCH_ENTITY_SETS,
  loadEntitySetSizes,
  searchEntitySets
} from './EntitySetActionFactory';

function* loadEntitySetSizesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadEntitySetSizes.request(action.id));

    const entitySetIds = action.value;
    const sizes = yield all(entitySetIds.map(id => call(DataApi.getEntitySetSize, id)));
    const results = {};
    entitySetIds.forEach((entitySetId, index) => {
      results[entitySetId] = sizes[index];
    });

    yield put(loadEntitySetSizes.success(action.id, results));
  }
  catch (error) {
    console.error(error);
    yield put(loadEntitySetSizes.failure(action.id, error));
  }
  finally {
    yield put(loadEntitySetSizes.finally(action.id));
  }
}

export function* loadEntitySetSizesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ENTITY_SET_SIZES, loadEntitySetSizesWorker);
}

function* searchEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchEntitySets.request(action.id));
    const results = yield call(SearchApi.searchEntitySetMetaData, action.value);
    yield put(searchEntitySets.success(action.id, results));

    yield put(loadEntitySetSizes(results.hits.map(({ entitySet }) => entitySet.id)));
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
