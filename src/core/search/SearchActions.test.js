import { Set } from 'immutable';

import * as SearchActions from './SearchActions';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'SEARCH_ENTITY_SETS',
]).sort().toJS();

const REQSEQ_NAMES = Set([
  'searchEntitySets',
]).sort().toJS();

describe('SearchActions', () => {

  testShouldExportActionTypes(SearchActions, ACTION_TYPES);
  testShouldExportRequestSequences(SearchActions, ACTION_TYPES, REQSEQ_NAMES);
});