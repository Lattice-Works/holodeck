/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const SEARCH_ENTITY_SETS :string = 'SEARCH_ENTITY_SETS';
const searchEntitySets :RequestSequence = newRequestSequence(SEARCH_ENTITY_SETS);

export {
  SEARCH_ENTITY_SETS,
  searchEntitySets
};
