/*
 * @flow
 */

import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_SET,
  exploreEntityData,
  exploreEntitySet,
} from './ExploreActions';

import { EDMUtils } from '../../core/edm';

const LOG = new Logger('EntityDataSagas');

const { EntitySet, EntitySetBuilder } = Models;

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const { getEntitySet, getPropertyTypeMetaDataForEntitySet } = EntitySetsApiActions;
const { getEntitySetWorker, getPropertyTypeMetaDataForEntitySetWorker } = EntitySetsApiSagas;

const { selectEntitySet } = EDMUtils;

/*
 *
 * ExploreActions.exploreEntityData
 *
 */

function* exploreEntityDataWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(exploreEntityData.request(action.id, action.value));

    const response :WorkerResponse = yield call(getEntityDataWorker, getEntityData(action.value));
    if (response.error) throw response.error;

    yield put(exploreEntityData.success(action.id, response.data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(exploreEntityData.failure(action.id, error));
  }
  finally {
    yield put(exploreEntityData.finally(action.id));
  }
}

function* exploreEntityDataWatcher() :Saga<*> {

  yield takeEvery(EXPLORE_ENTITY_DATA, exploreEntityDataWorker);
}

/*
 *
 * ExploreActions.exploreEntitySet
 *
 */

function* exploreEntitySetWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(exploreEntitySet.request(action.id, action.value));

    const entitySetId :UUID = action.value;

    // let meta;
    let entitySet :?EntitySet = yield select(selectEntitySet(entitySetId));

    // TODO: expire stored data
    if (!entitySet) {

      const responses :WorkerResponse[] = yield all([
        call(getEntitySetWorker, getEntitySet(entitySetId)),
        call(getPropertyTypeMetaDataForEntitySetWorker, getPropertyTypeMetaDataForEntitySet({ entitySetId })),
      ]);

      if (responses[0].error) throw responses[0].error;
      if (responses[1].error) throw responses[1].error;

      // TODO: metadata will need to be used
      // meta = responses[1].data;
      entitySet = (new EntitySetBuilder(responses[0].data)).build();
    }

    yield put(exploreEntitySet.success(action.id, { entitySet }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(exploreEntitySet.failure(action.id, error));
  }
  finally {
    yield put(exploreEntitySet.finally(action.id));
  }
}

function* exploreEntitySetWatcher() :Saga<*> {

  yield takeEvery(EXPLORE_ENTITY_SET, exploreEntitySetWorker);
}

export {
  exploreEntityDataWatcher,
  exploreEntityDataWorker,
  exploreEntitySetWatcher,
  exploreEntitySetWorker,
};
