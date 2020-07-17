/*
 * @flow
 */

import {
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import {
  List,
  Map,
  Set,
  fromJS,
} from 'immutable';
import {
  DataApiActions,
  DataApiSagas,
  DataSetsApiActions,
  DataSetsApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  FETCH_ATLAS_DATA_SET_DATA,
  FETCH_ENTITY_SET_DATA,
  fetchAtlasDataSetData,
  fetchEntitySetData,
} from './DataActions';
import { selectStoredEntityKeyIds } from './DataUtils';

const LOG = new Logger('DataSagas');

const { getEntitySetData } = DataApiActions;
const { getEntitySetDataWorker } = DataApiSagas;
const { getOrganizationDataSetData } = DataSetsApiActions;
const { getOrganizationDataSetDataWorker } = DataSetsApiSagas;

/*
 *
 * DataActions.fetchAtlasDataSetData
 *
 */

function* fetchAtlasDataSetDataWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(fetchAtlasDataSetData.request(action.id, action.value));

    const { atlasDataSetId, count = 10, organizationId } :{
      atlasDataSetId :UUID;
      count ?:number;
      organizationId :UUID;
    } = action.value;

    // TODO: use stored data if available
    const response :WorkerResponse = yield call(
      getOrganizationDataSetDataWorker,
      getOrganizationDataSetData({ count, dataSetId: atlasDataSetId, organizationId }),
    );
    if (response.error) throw response.error;

    /*
     * response.data is a map of column id to column values, which won't work for the table component. we need to
     * "flip" this so that columns are vertical, i.e. each row contains a value from each column at that index
     */
    const data = List().withMutations((mutable :List) => {
      fromJS(response.data).forEach((columnValues :mixed[], columnId :UUID) => {
        columnValues.forEach((value :mixed, rowIndex :number) => {
          mutable.update(rowIndex, (row :Map = Map()) => row.set(columnId, value));
        });
      });
    });

    yield put(fetchAtlasDataSetData.success(action.id, data));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(fetchAtlasDataSetData.failure(action.id, error));
  }
  finally {
    yield put(fetchAtlasDataSetData.finally(action.id));
  }
}

function* fetchAtlasDataSetDataWatcher() :Saga<*> {

  yield takeEvery(FETCH_ATLAS_DATA_SET_DATA, fetchAtlasDataSetDataWorker);
}

/*
 *
 * DataActions.fetchEntitySetData
 *
 */

function* fetchEntitySetDataWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(fetchEntitySetData.request(action.id, action.value));

    const { entityKeyIds, entitySetId } :{
      entityKeyIds :Set<UUID>;
      entitySetId :UUID;
    } = action.value;

    // TODO: expire stored data
    const storedEntityKeyIds :Set<UUID> = yield select(selectStoredEntityKeyIds(entitySetId, entityKeyIds));
    const missingEntityKeyIds :Set<UUID> = entityKeyIds.subtract(storedEntityKeyIds);

    let entitySetData = {};
    if (!missingEntityKeyIds.isEmpty()) {
      const response :WorkerResponse = yield call(
        getEntitySetDataWorker,
        getEntitySetData({ entitySetId, entityKeyIds: missingEntityKeyIds.toJS() }),
      );
      if (response.error) throw response.error;
      entitySetData = response.data;
    }

    yield put(fetchEntitySetData.success(action.id, entitySetData));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(fetchEntitySetData.failure(action.id, error));
  }
  finally {
    yield put(fetchEntitySetData.finally(action.id));
  }
}

function* fetchEntitySetDataWatcher() :Saga<*> {

  yield takeEvery(FETCH_ENTITY_SET_DATA, fetchEntitySetDataWorker);
}

export {
  fetchAtlasDataSetDataWatcher,
  fetchAtlasDataSetDataWorker,
  fetchEntitySetDataWatcher,
  fetchEntitySetDataWorker,
};
