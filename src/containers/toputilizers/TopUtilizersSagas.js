/*
 * @flow
 */

import { AnalysisApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  getNeighborTypes,
  getTopUtilizers
} from './TopUtilizersActionFactory';

function* getTopUtilizersWorker(action :SequenceAction) {
  try {
    yield put(getTopUtilizers.request(action.id));

    const topUtilizers = yield call(AnalysisApi.getTopUtilizers, action.value);
    yield put(getTopUtilizers.success(action.id, topUtilizers));
  }
  catch (error) {
    console.error(error);
    yield put(getTopUtilizers.failure(action.id, error));
  }
  finally {
    yield put(getTopUtilizers.finally(action.id));
  }
}

export function* getTopUtilizersWatcher() {
  yield takeEvery(GET_TOP_UTILIZERS, getTopUtilizersWorker);
}

function* getNeighborTypesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getNeighborTypes.request(action.id, action.value));
    const results = yield call(AnalysisApi.getNeighborTypes, action.value);
    yield put(getNeighborTypes.success(action.id, results));
  }
  catch (error) {
    yield put(getNeighborTypes.failure(action.id, error));
  }
  finally {
    yield put(getNeighborTypes.finally(action.id));
  }
}

export function* getNeighborTypesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_NEIGHBOR_TYPES, getNeighborTypesWorker);
}
