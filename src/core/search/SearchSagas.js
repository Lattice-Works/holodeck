/*
 * @flow
 */

import { call, put, takeEvery } from '@redux-saga/core/effects';
import { List, fromJS } from 'immutable';
import { Models } from 'lattice';
import {
  EntitySetsApiActions,
  EntitySetsApiSagas,
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import { DataUtils, Logger, ValidationUtils } from 'lattice-utils';
import type { Saga } from '@redux-saga/core';
import type { EntitySetObject, PropertyTypeObject } from 'lattice';
import type { WorkerResponse } from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import {
  SEARCH_ENTITY_SET,
  SEARCH_ENTITY_SETS,
  SEARCH_ORG_DATA_SETS,
  searchEntitySet,
  searchEntitySets,
  searchOrgDataSets,
} from './SearchActions';
import { MAX_HITS_10, MAX_HITS_20 } from './constants';

const LOG = new Logger('SearchSagas');

type SearchEntitySetsHit = {
  entitySet :EntitySetObject;
  propertyTypes :PropertyTypeObject[];
};

const { EntitySet, EntitySetBuilder } = Models;
const { getPropertyValue } = DataUtils;
const { isValidUUID } = ValidationUtils;

const { getEntitySets } = EntitySetsApiActions;
const { getEntitySetsWorker } = EntitySetsApiSagas;
const { searchEntitySetData, searchEntitySetMetaData } = SearchApiActions;
const { searchEntitySetDataWorker, searchEntitySetMetaDataWorker } = SearchApiSagas;

/*
 *
 * SearchActions.searchEntitySet
 *
 */

function* searchEntitySetWorker(action :SequenceAction) :Saga<WorkerResponse> {

  let workerResponse :WorkerResponse;

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

    workerResponse = {
      data: {
        hits: response.data.hits || [],
        totalHits: response.data.numHits || 0,
      }
    };

    yield put(searchEntitySet.success(action.id, { hits, totalHits }));
  }
  catch (error) {
    workerResponse = { error };
    LOG.error(action.type, error);
    yield put(searchEntitySet.failure(action.id, error));
  }
  finally {
    yield put(searchEntitySet.finally(action.id));
  }

  return workerResponse;
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

    const hits = response.data.hits || [];
    const totalHits = response.data.numHits || 0;

    const entitySets :List<EntitySet> = List().withMutations((list) => {
      hits.forEach((hit :SearchEntitySetsHit) => {
        try {
          list.push((new EntitySetBuilder(hit.entitySet)).build());
        }
        catch (e) {
          LOG.error(action.type, e);
          LOG.error(action.type, hit);
        }
      });
    });

    yield put(searchEntitySets.success(action.id, {
      totalHits,
      hits: entitySets,
    }));
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

/*
 *
 * SearchActions.searchOrgDataSets
 *
 */

function* searchOrgDataSetsWorker(action :SequenceAction) :Saga<*> {

  try {
    yield put(searchOrgDataSets.request(action.id, action.value));

    const response :WorkerResponse = yield call(searchEntitySetWorker, searchEntitySet(action.value));
    if (response.error) throw response.error;

    const entitySetIds = response.data.hits
      .map((hit) => getPropertyValue(hit, ['ol.id', 0]))
      .filter((id) => isValidUUID(id));

    const atlasDataSetIds = response.data.hits
      .filter((hit) => Number.isInteger(getPropertyValue(hit, ['ol.pgoid', 0])))
      .map((hit) => getPropertyValue(hit, ['ol.id', 0]))
      .filter((id) => isValidUUID(id));

    yield call(getEntitySetsWorker, getEntitySets(entitySetIds));

    yield put(searchOrgDataSets.success(action.id, {
      atlasDataSetIds,
      entitySetIds,
      totalHits: response.data.totalHits
    }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchOrgDataSets.failure(action.id, error));
  }
  finally {
    yield put(searchOrgDataSets.finally(action.id));
  }
}

function* searchOrgDataSetsWatcher() :Saga<*> {

  yield takeEvery(SEARCH_ORG_DATA_SETS, searchOrgDataSetsWorker);
}

export {
  searchEntitySetWatcher,
  searchEntitySetWorker,
  searchEntitySetsWatcher,
  searchEntitySetsWorker,
  searchOrgDataSetsWatcher,
  searchOrgDataSetsWorker,
};
