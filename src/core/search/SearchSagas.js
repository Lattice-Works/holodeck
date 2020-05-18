/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { fromJS } from 'immutable';
import { SearchApiActions, SearchApiSagas } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  SEARCH_ENTITY_SET,
  SEARCH_ENTITY_SETS,
  searchEntitySet,
  searchEntitySets,
} from './SearchActions';
import { MAX_HITS_10, MAX_HITS_20 } from './constants';

const LOG = new Logger('SearchSagas');

const { searchEntitySetData, searchEntitySetMetaData } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntitySetMetaDataWorker } = SearchApiSagas;

/*
 *
 * SearchActions.searchEntitySet
 *
 */

function* searchEntitySetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchEntitySet.request(action.id, action.value));

    const {
      entitySetId,
      query,
      maxHits = MAX_HITS_10,
      start = 0,
    } = action.value;

    const searchConstraints = {
      maxHits,
      start,
      constraints: [{
        constraints: [{
          searchTerm: query,
        }],
      }],
      entitySetIds: [entitySetId],
    };

    const response :WorkerResponse = yield call(
      searchEntitySetDataWorker,
      searchEntitySetData(searchConstraints),
    );

    if (response.error) throw response.error;

    const hits = fromJS(response.data.hits || []);
    const totalHits = response.data.numHits || 0;
    yield put(searchEntitySet.success(action.id, { hits, totalHits }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchEntitySet.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySet.finally(action.id));
  }
}

function* searchEntitySetWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ENTITY_SET, searchEntitySetWorker);
}

/*
 *
 * SearchActions.searchEntitySets
 *
 */

function* searchEntitySetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchEntitySets.request(action.id, action.value));

    const {
      query,
      maxHits = MAX_HITS_20,
      start = 0,
    } = action.value;
    const response :WorkerResponse = yield call(
      searchEntitySetMetaDataWorker,
      searchEntitySetMetaData({
        maxHits,
        start,
        searchTerm: query,
      }),
    );

    if (response.error) throw response.error;

    const hits = fromJS(response.data.hits || []);
    const totalHits = response.data.numHits || 0;
    yield put(searchEntitySets.success(action.id, { hits, totalHits }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchEntitySets.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySets.finally(action.id));
  }
}

function* searchEntitySetsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ENTITY_SETS, searchEntitySetsWorker);
}

export {
  searchEntitySetWatcher,
  searchEntitySetWorker,
  searchEntitySetsWatcher,
  searchEntitySetsWorker,
};
