/*
 * @flow
 */

import { AnalysisApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  GET_TOP_UTILIZERS,
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
