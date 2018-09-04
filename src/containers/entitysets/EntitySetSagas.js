/*
 * @flow
 */

import { EntityDataModelApi, SearchApi } from 'lattice';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET,
  searchEntitySets,
  selectEntitySet
} from './EntitySetActionFactory';
import { getFqnString } from '../../utils/DataUtils';
import { PERSON_ENTITY_TYPE_FQN } from '../../utils/constants/DataModelConstants';

function* searchEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(searchEntitySets.request(action.id));
    const results = yield call(SearchApi.searchEntitySetMetaData, action.value);
    yield put(searchEntitySets.success(action.id, results));
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

function* selectEntitySetWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    const { entitySet } = action.value;
    yield put(selectEntitySet.request(action.id, action.value));
    let isPersonType = false;
    if (entitySet) {
      const entityTypeId = entitySet.get('entityTypeId');
      const entityType = yield call(EntityDataModelApi.getEntityType, entityTypeId);
      isPersonType = getFqnString(entityType.type) === PERSON_ENTITY_TYPE_FQN;
    }

    yield put(selectEntitySet.success(action.id, isPersonType));
  }
  catch (error) {
    console.error(error);
    yield put(selectEntitySet.failure(action.id, error));
  }
  finally {
    yield put(selectEntitySet.finally(action.id));
  }
}

export function* selectEntitySetWatcher() :Generator<*, *, *> {
  yield takeEvery(SELECT_ENTITY_SET, selectEntitySetWorker);
}
