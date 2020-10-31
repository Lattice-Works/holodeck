/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_SEARCH_STATE :'CLEAR_SEARCH_STATE' = 'CLEAR_SEARCH_STATE';
const clearSearchState = (action :string) => ({
  type: CLEAR_SEARCH_STATE,
  value: action || '',
});

const SEARCH_ENTITY_SET :'SEARCH_ENTITY_SET' = 'SEARCH_ENTITY_SET';
const searchEntitySet :RequestSequence = newRequestSequence(SEARCH_ENTITY_SET);

const SEARCH_ENTITY_SETS :'SEARCH_ENTITY_SETS' = 'SEARCH_ENTITY_SETS';
const searchEntitySets :RequestSequence = newRequestSequence(SEARCH_ENTITY_SETS);

const SEARCH_ORG_DATA_SETS :'SEARCH_ORG_DATA_SETS' = 'SEARCH_ORG_DATA_SETS';
const searchOrgDataSets :RequestSequence = newRequestSequence(SEARCH_ORG_DATA_SETS);

export {
  CLEAR_SEARCH_STATE,
  SEARCH_ENTITY_SET,
  SEARCH_ENTITY_SETS,
  SEARCH_ORG_DATA_SETS,
  clearSearchState,
  searchEntitySet,
  searchEntitySets,
  searchOrgDataSets,
};
