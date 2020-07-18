import { OrderedSet } from 'immutable';

import * as EDMActions from './EDMActions';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../utils/testing/TestUtils';

const ACTION_TYPES = OrderedSet([
  'GET_EDM_TYPES',
  'GET_ENTITY_SETS_WITH_METADATA',
]).toJS();

const REQSEQ_NAMES = OrderedSet([
  'getEntityDataModelTypes',
  'getEntitySetsWithMetaData',
]).toJS();

describe('EDMActions', () => {

  testShouldExportActionTypes(EDMActions, ACTION_TYPES);
  testShouldExportRequestSequences(EDMActions, ACTION_TYPES, REQSEQ_NAMES);
});
