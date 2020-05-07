import { Set } from 'immutable';

import * as EDMActions from './EDMActions';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'GET_EDM_TYPES',
  'GET_ENTITY_SETS_WITH_METADATA',
]).sort().toJS();

const REQSEQ_NAMES = Set([
  'getEntityDataModelTypes',
  'getEntitySetsWithMetaData',
]).sort().toJS();

describe('EDMActions', () => {

  testShouldExportActionTypes(EDMActions, ACTION_TYPES);
  testShouldExportRequestSequences(EDMActions, ACTION_TYPES, REQSEQ_NAMES);
});
