/*
 * @flow
 */

import { EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import { getEntityKeyId } from '../../utils/DataUtils';
import {
  LOAD_ENTITY_NEIGHBORS,
  loadEntityNeighbors
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
