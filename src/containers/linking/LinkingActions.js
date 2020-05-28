/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const SEARCH_LINKED_ENTITY_SETS :'SEARCH_LINKED_ENTITY_SETS' = 'SEARCH_LINKED_ENTITY_SETS';
const searchLinkedEntitySets :RequestSequence = newRequestSequence(SEARCH_LINKED_ENTITY_SETS);

export {
  SEARCH_LINKED_ENTITY_SETS,
  searchLinkedEntitySets,
};
