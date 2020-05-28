/*
 * @flow
 */

import _has from 'lodash/has';
import {
  all,
  call,
  put,
  select,
  takeEvery,
} from '@redux-saga/core/effects';
import { List, Map, Set, fromJS } from 'immutable';
import { Models } from 'lattice';
import {
  DataApiActions,
  DataApiSagas,
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_NEIGHBORS,
  EXPLORE_ENTITY_SET,
  exploreEntityData,
  exploreEntityNeighbors,
  exploreEntitySet,
} from './ExploreActions';

import { EDMUtils } from '../../core/edm';

const LOG = new Logger('EntityDataSagas');

const { EntitySet, EntitySetBuilder } = Models;

const { getEntityData } = DataApiActions;
const { getEntityDataWorker } = DataApiSagas;
const {
  getEntitySet,
  getEntitySets,
  getPropertyTypeMetaDataForEntitySet,
} = EntitySetsApiActions;
const {
  getEntitySetWorker,
  getEntitySetsWorker,
  getPropertyTypeMetaDataForEntitySetWorker,
} = EntitySetsApiSagas;
const { searchEntityNeighborsWithFilter } = SearchApiActions;
const { searchEntityNeighborsWithFilterWorker } = SearchApiSagas;

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
 * ExploreActions.exploreEntityNeighbors
 *
 */

function* exploreEntityNeighborsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(exploreEntityNeighbors.request(action.id, action.value));

    const { entityKeyId, entitySetId } = action.value;
    const response :WorkerResponse = yield call(
      searchEntityNeighborsWithFilterWorker,
      searchEntityNeighborsWithFilter({
        entitySetId,
        filter: { entityKeyIds: [entityKeyId] },
        idsOnly: true,
      }),
    );

    if (response.error) throw response.error;
    let neighbors = {};
    if (_has(response.data, entityKeyId)) {
      /*
       * this is the structure of the "ids only" neighbors response:
       *   {
       *     associationEntitySetId: {
       *       entitySetId: [{
       *         "associationId": associationEntityKeyId
       *         "neighborId": neighborEntityKeyId
       *       }]
       *     }
       *   }
       */
      neighbors = response.data[entityKeyId];
    }

    const iNeighbors = fromJS(neighbors);
    const entitySetIds :UUID[] = Set().withMutations((set) => {
      iNeighbors.reduce((ids, value, key) => ids.add(key).add(value.keySeq()), set);
    }).flatten().toJS();

    yield call(getEntitySetsWorker, getEntitySets(entitySetIds));

    yield put(exploreEntityNeighbors.success(action.id, iNeighbors));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(exploreEntityNeighbors.failure(action.id, error));
  }
  finally {
    yield put(exploreEntityNeighbors.finally(action.id));
  }
}

function* exploreEntityNeighborsWatcher() :Saga<*> {

  yield takeEvery(EXPLORE_ENTITY_NEIGHBORS, exploreEntityNeighborsWorker);
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
  exploreEntityNeighborsWatcher,
  exploreEntityNeighborsWorker,
  exploreEntitySetWatcher,
  exploreEntitySetWorker,
};
