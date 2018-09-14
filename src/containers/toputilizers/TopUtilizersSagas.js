/*
 * @flow
 */

import { AnalysisApi, SearchApi } from 'lattice';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  LOAD_TOP_UTILIZER_NEIGHBORS,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors
} from './TopUtilizersActionFactory';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { getEntityKeyId } from '../../utils/DataUtils';

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

    yield put(loadTopUtilizerNeighbors({ entitySetId, topUtilizers, filters }));
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

function* loadTopUtilizerNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadTopUtilizerNeighbors.request(action.id));
    const { entitySetId, filters, topUtilizers } = action.value;

    let initFilterMap = Map();

    filters.forEach((filter) => {
      const pair = List.of(filter[TOP_UTILIZERS_FILTER.ASSOC_ID], filter[TOP_UTILIZERS_FILTER.NEIGHBOR_ID]);
      initFilterMap = initFilterMap.set(pair, 0);
    });

    const ids = fromJS(topUtilizers).map(getEntityKeyId);

    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, ids.toJS());

    let neighborCounts = Map();

    Object.keys(neighborsById).forEach((entityKeyId) => {
      const neighborList = neighborsById[entityKeyId];
      let counts = initFilterMap;

      neighborList.forEach((neighbor) => {
        const { associationEntitySet, neighborEntitySet } = neighbor;
        if (associationEntitySet && neighborEntitySet) {
          const assocId = associationEntitySet.entityTypeId;
          const neighborId = neighborEntitySet.entityTypeId;
          delete neighbor.associationPropertyTypes;

          if (assocId && neighborId) {
            delete neighbor.neighborPropertyTypes;
            const pair = List.of(assocId, neighborId);

            if (counts.has(pair)) {
              counts = counts.set(pair, counts.get(pair) + 1);
            }
          }
        }
      });
      neighborCounts = neighborCounts.set(entityKeyId, counts);
    });

    yield put(loadTopUtilizerNeighbors.success(action.id, { neighborCounts, neighborsById }));
  }
  catch (error) {
    console.error(error)
    yield put(loadTopUtilizerNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadTopUtilizerNeighbors.finally(action.id));
  }
}

export function* loadTopUtilizerNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_TOP_UTILIZER_NEIGHBORS, loadTopUtilizerNeighborsWorker);
}
