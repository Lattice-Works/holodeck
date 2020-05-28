/*
 * @flow
 */

import {
  all,
  delay,
  call,
  put,
  takeEvery,
  takeLatest,
} from '@redux-saga/core/effects';
import { List, fromJS } from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import {
  LOAD_ENTITY_SET_SIZES,
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET_BY_ID,
  loadEntitySetSizes,
  searchEntitySets,
  selectEntitySetById
} from './EntitySetActions';

const LOG = new Logger('EntitySetSagas');

const { getEntitySetSize } = DataApiActions;
const { getEntitySetSizeWorker } = DataApiSagas;
const { getEntitySet } = EntitySetsApiActions;
const { getEntitySetWorker } = EntitySetsApiSagas;
const { searchEntitySetMetaData } = SearchApiActions;
const { searchEntitySetMetaDataWorker } = SearchApiSagas;

function* loadEntitySetSizesWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(loadEntitySetSizes.request(action.id));

    const entitySetIds :UUID[] = action.value;
    const callMap = entitySetIds.reduce((map :Object, entitySetId :UUID) => {
      // https://github.com/airbnb/javascript/issues/719
      /* eslint-disable-next-line no-param-reassign */
      map[entitySetId] = call(getEntitySetSizeWorker, getEntitySetSize(entitySetId));
      return map;
    }, {});

    const responses :Object = yield all(callMap);

    const entitySetSizesMap = entitySetIds.reduce((map :Object, entitySetId :UUID) => {
      const response = responses[entitySetId];
      if (response.error) {
        // https://github.com/airbnb/javascript/issues/719
        /* eslint-disable-next-line no-param-reassign */
        map[entitySetId] = 0;
      }
      else {
        /* eslint-disable-next-line no-param-reassign */
        map[entitySetId] = response.data;
      }
      return map;
    }, {});

    yield put(loadEntitySetSizes.success(action.id, entitySetSizesMap));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadEntitySetSizes.failure(action.id, error));
  }
  finally {
    yield put(loadEntitySetSizes.finally(action.id));
  }
}

function* loadEntitySetSizesWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_ENTITY_SET_SIZES, loadEntitySetSizesWorker);
}

function* selectEntitySetByIdWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(selectEntitySetById.request(action.id));
    const response = yield call(getEntitySetWorker, getEntitySet(action.value));
    if (response.error) throw response.error;
    yield put(selectEntitySetById.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(selectEntitySetById.failure(action.id, error));
  }
  finally {
    yield put(selectEntitySetById.finally(action.id));
  }
}

function* selectEntitySetByIdWatcher() :Generator<*, *, *> {
  yield takeEvery(SELECT_ENTITY_SET_BY_ID, selectEntitySetByIdWorker);
}

function* searchEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(searchEntitySets.request(action.id, action.value));

    yield delay(1000);

    const { searchTerm } = action.value;
    let searchResults = List();
    if (searchTerm || searchTerm.length > 1) {
      const response = yield call(searchEntitySetMetaDataWorker, searchEntitySetMetaData(action.value));
      if (response.error) throw response.error;
      searchResults = fromJS(response.data);
    }

    yield put(searchEntitySets.success(action.id, searchResults));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchEntitySets.failure(action.id));
  }
  finally {
    yield put(searchEntitySets.finally(action.id));
  }
}

function* searchEntitySetsWatcher() :Generator<*, *, *> {

  yield takeLatest(SEARCH_ENTITY_SETS, searchEntitySetsWorker);
}

export {
  loadEntitySetSizesWatcher,
  loadEntitySetSizesWorker,
  searchEntitySetsWatcher,
  searchEntitySetsWorker,
  selectEntitySetByIdWatcher,
  selectEntitySetByIdWorker,
};
