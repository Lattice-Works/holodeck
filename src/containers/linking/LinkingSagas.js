/*
 * @flow
 */

import {
  all,
  delay,
  call,
  put,
  select,
  takeEvery,
  takeLatest,
} from '@redux-saga/core/effects';
import { List, fromJS } from 'immutable';
import {
  SearchApiActions,
  SearchApiSagas,
} from 'lattice-sagas';
import type { SequenceAction } from 'redux-reqseq';

import Logger from '../../utils/Logger';
import {
  SEARCH_LINKED_ENTITY_SETS,
  searchLinkedEntitySets,
} from './LinkingActions';
import { isNonEmptyString } from '../../utils/LangUtils';

const LOG = new Logger('EntitySetSagas');

const { searchEntitySetData } = SearchApiActions;
const { searchEntitySetDataWorker } = SearchApiSagas;

function* searchLinkedEntitySetsWorker(action :SequenceAction) :Generator<*, *, *> {

  try {
    yield put(searchLinkedEntitySets.request(action.id, action.value));

    const { entitySetIds, searchFieldValues } = action.value;

    const searchFields = searchFieldValues
      .filter((searchField :Object) => isNonEmptyString(searchField.value))
      .map((searchField :Object) => ({
        property: searchField.propertyTypeId,
        searchTerm: searchField.value,
      }));

    const searchOptions = {
      searchFields,
      start: 0,
      maxHits: 1000,
    };

    const callMap = {};
    entitySetIds.forEach((entitySetId :UUID) => {
      callMap[entitySetId] = call(
        searchEntitySetDataWorker,
        searchEntitySetData({ entitySetId, searchOptions })
      );
    });

    const responses :Object = yield all(callMap);

    const searchResults :Object = {};
    let errorCount :number = 0;

    Object.keys(responses).forEach((entitySetId :UUID) => {
      const response = responses[entitySetId];
      if (response.error) {
        errorCount += 1;
        LOG.error(action.type, response.error);
      }
      else {
        searchResults[entitySetId] = response.data;
      }
    });

    // we'll allow some of the requests to fail, but not all
    if (errorCount === responses.length) {
      throw new Error('all searches failed');
    }

    yield put(searchLinkedEntitySets.success(action.id, fromJS(searchResults)));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(searchLinkedEntitySets.failure(action.id));
  }
  finally {
    yield put(searchLinkedEntitySets.finally(action.id));
  }
}

function* searchLinkedEntitySetsWatcher() :Generator<*, *, *> {

  yield takeEvery(SEARCH_LINKED_ENTITY_SETS, searchLinkedEntitySetsWorker);
}

export {
  searchLinkedEntitySetsWatcher,
  searchLinkedEntitySetsWorker,
};
