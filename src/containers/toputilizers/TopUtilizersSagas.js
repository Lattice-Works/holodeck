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
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';

function* getTopUtilizersWorker(action :SequenceAction) {
  try {
    const { entitySetId, numResults, filters } = action.value;
    yield put(getTopUtilizers.request(action.id, filters));

    const formattedFilters = filters.map(selectedType => ({
      associationTypeId: selectedType[TOP_UTILIZERS_FILTER.ASSOC_ID],
      neighborTypeIds: [selectedType[TOP_UTILIZERS_FILTER.NEIGHBOR_ID]],
      utilizerIsSrc: selectedType[TOP_UTILIZERS_FILTER.IS_SRC]
    }));

    const topUtilizers = yield call(AnalysisApi.getTopUtilizers, entitySetId, numResults, formattedFilters);
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
