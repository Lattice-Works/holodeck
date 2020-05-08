/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SEARCH_ENTITY_SETS :'SEARCH_ENTITY_SETS' = 'SEARCH_ENTITY_SETS';
const searchEntitySets :RequestSequence = newRequestSequence(SEARCH_ENTITY_SETS);

export {
  SEARCH_ENTITY_SETS,
  searchEntitySets,
};
