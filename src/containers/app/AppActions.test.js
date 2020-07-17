import { Set } from 'immutable';

import * as AppActions from './AppActions';

import { testShouldExportActionTypes, testShouldExportRequestSequences } from '../../utils/testing/TestUtils';

const ACTION_TYPES = Set([
  'INITIALIZE_APPLICATION',
]).toJS();

const REQSEQ_NAMES = Set([
  'initializeApplication',
]).toJS();

describe('AppActions', () => {

  testShouldExportActionTypes(AppActions, ACTION_TYPES);
  testShouldExportRequestSequences(AppActions, ACTION_TYPES, REQSEQ_NAMES);
});
