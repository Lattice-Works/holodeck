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
  SEARCH_ENTITY_SETS,
  searchEntitySets,
} from './SearchActions';
import { MAX_HITS } from './constants';

const LOG = new Logger('SearchSagas');

const { searchEntitySetMetaData } = SearchApiActions;
const { searchEntitySetMetaDataWorker } = SearchApiSagas;

/*
 *
 * SearchActions.searchEntitySets
 *
 */

function* searchEntitySetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchEntitySets.request(action.id, action.value));

    const { maxHits = MAX_HITS, query, start = 0 } = action.value;
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
  searchEntitySetsWatcher,
  searchEntitySetsWorker,
};
