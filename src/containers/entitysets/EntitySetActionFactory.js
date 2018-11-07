/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const SEARCH_ENTITY_SETS :string = 'SEARCH_ENTITY_SETS';
const searchEntitySets :RequestSequence = newRequestSequence(SEARCH_ENTITY_SETS);

const SELECT_ENTITY_SET :string = 'SELECT_ENTITY_SET';
const selectEntitySet :RequestSequence = newRequestSequence(SELECT_ENTITY_SET);

const SELECT_ENTITY_SET_PAGE :string = 'SELECT_ENTITY_SET_PAGE';
const selectEntitySetPage :RequestSequence = newRequestSequence(SELECT_ENTITY_SET_PAGE);

export {
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET,
  SELECT_ENTITY_SET_PAGE,
  searchEntitySets,
  selectEntitySet,
  selectEntitySetPage
};
