/*
 * @flow
 */

import {
  all,
  call,
  put,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  EntityDataModelApiActions,
  EntityDataModelApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import { isDefined } from '../../utils/LangUtils';
import {
  GET_EDM_TYPES,
  GET_ENTITY_SETS_WITH_METADATA,
  getEntityDataModelTypes,
  getEntitySetsWithMetaData,
} from './EDMActions';

const LOG = new Logger('EDMSagas');

const { getAllEntityTypes, getAllPropertyTypes } = EntityDataModelApiActions;
const { getAllEntityTypesWorker, getAllPropertyTypesWorker } = EntityDataModelApiSagas;
const { getAllEntitySets, getPropertyTypeMetaDataForEntitySets } = EntitySetsApiActions;
const { getAllEntitySetsWorker, getPropertyTypeMetaDataForEntitySetsWorker } = EntitySetsApiSagas;

/*
 *
 * EDMActions.getEntityDataModelTypes()
 *
 */

function* getEntityDataModelTypesWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};

  try {
    yield put(getEntityDataModelTypes.request(action.id));

    const responses :Object[] = yield all([
      call(getAllEntityTypesWorker, getAllEntityTypes()),
      call(getAllPropertyTypesWorker, getAllPropertyTypes()),
    ]);

    // all requests must succeed
    const responseError = responses.reduce(
      (error :any, r :Object) => (isDefined(error) ? error : r.error),
      undefined,
    );
    if (responseError) throw responseError;

    yield put(getEntityDataModelTypes.success(action.id, {
      entityTypes: responses[0].data,
      propertyTypes: responses[1].data,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getEntityDataModelTypes.failure(action.id, error));
  }
  finally {
    yield put(getEntityDataModelTypes.finally(action.id));
  }

  return workerResponse;
}

function* getEntityDataModelTypesWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_EDM_TYPES, getEntityDataModelTypesWorker);
}

/*
 *
 * EDMActions.getEntitySetsWithMetaData()
 *
 */

function* getEntitySetsWithMetaDataWorker(action :SequenceAction) :Generator<*, *, *> {

  const workerResponse :Object = {};

  try {
    yield put(getEntitySetsWithMetaData.request(action.id));

    let response = yield call(getAllEntitySetsWorker, getAllEntitySets());
    if (response.error) throw response.error;

    const entitySets :Object[] = response.data;
    const entitySetIds :UUID[] = entitySets.map((es) => es.id);

    response = yield call(
      getPropertyTypeMetaDataForEntitySetsWorker,
      getPropertyTypeMetaDataForEntitySets(entitySetIds)
    );
    if (response.error) throw response.error;

    const metadata :Object = response.data;
    yield put(getEntitySetsWithMetaData.success(action.id, {
      entitySets,
      entitySetsMetaData: metadata,
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    workerResponse.error = error;
    yield put(getEntitySetsWithMetaData.failure(action.id, error));
  }
  finally {
    yield put(getEntitySetsWithMetaData.finally(action.id));
  }

  return workerResponse;
}

function* getEntitySetsWithMetaDataWatcher() :Generator<*, *, *> {

  yield takeEvery(GET_ENTITY_SETS_WITH_METADATA, getEntitySetsWithMetaDataWorker);
}

export {
  getEntityDataModelTypesWatcher,
  getEntityDataModelTypesWorker,
  getEntitySetsWithMetaDataWatcher,
  getEntitySetsWithMetaDataWorker,
};
