/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { SearchApi } from 'lattice';

import { getEntityKeyId } from '../../utils/DataUtils';
import { PAGE_SIZE } from '../../utils/constants/ExploreConstants';
import {
  LOAD_ENTITY_NEIGHBORS,
  SEARCH_ENTITY_SET_DATA,
  loadEntityNeighbors,
  searchEntitySetData
} from './ExploreActionFactory';

function* loadEntityNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { entitySetId, entity } = action.value;
    yield put(loadEntityNeighbors.request(action.id, action.value));

    const entityKeyId = getEntityKeyId(entity);
    const neighbors = yield call(SearchApi.searchEntityNeighbors, entitySetId, entityKeyId);
    yield put(loadEntityNeighbors.success(action.id, { neighbors, entity }));
  }
  catch (error) {
    console.error(error);
    yield put(loadEntityNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadEntityNeighbors.finally(action.id));
  }
}

export function* loadEntityNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ENTITY_NEIGHBORS, loadEntityNeighborsWorker);
}

function* searchEntitySetDataWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchEntitySetData.request(action.id));
    const { entitySetId, start, searchTerm } = action.value;

    const results = yield call(SearchApi.searchEntitySetData, entitySetId, {
      searchTerm,
      start,
      maxHits: PAGE_SIZE
    });

    yield put(searchEntitySetData.success(action.id, results));
  }
  catch (error) {
    yield put(searchEntitySetData.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySetData.finally(action.id));
  }
}

export function* searchEntitySetDataWatcher() :Generator<*, *, *> {
  yield takeEvery(SEARCH_ENTITY_SET_DATA, searchEntitySetDataWorker);
}
