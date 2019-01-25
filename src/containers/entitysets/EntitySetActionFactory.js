/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_ENTITY_SET_SIZES :string = 'LOAD_ENTITY_SET_SIZES';
const loadEntitySetSizes :RequestSequence = newRequestSequence(LOAD_ENTITY_SET_SIZES);

const SEARCH_ENTITY_SETS :string = 'SEARCH_ENTITY_SETS';
const searchEntitySets :RequestSequence = newRequestSequence(SEARCH_ENTITY_SETS);

const SELECT_ENTITY_SET :string = 'SELECT_ENTITY_SET';
const selectEntitySet :RequestSequence = newRequestSequence(SELECT_ENTITY_SET);

const SELECT_ENTITY_SET_BY_ID :string = 'SELECT_ENTITY_SET_BY_ID';
const selectEntitySetById :RequestSequence = newRequestSequence(SELECT_ENTITY_SET_BY_ID);

const SELECT_ENTITY_SET_PAGE :string = 'SELECT_ENTITY_SET_PAGE';
const selectEntitySetPage :RequestSequence = newRequestSequence(SELECT_ENTITY_SET_PAGE);

const SET_SHOW_ASSOCIATION_ENTITY_SETS :string = 'SET_SHOW_ASSOCIATION_ENTITY_SETS';
const setShowAssociationEntitySets :RequestSequence = newRequestSequence(SET_SHOW_ASSOCIATION_ENTITY_SETS);

export {
  LOAD_ENTITY_SET_SIZES,
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET,
  SELECT_ENTITY_SET_BY_ID,
  SELECT_ENTITY_SET_PAGE,
  SET_SHOW_ASSOCIATION_ENTITY_SETS,
  loadEntitySetSizes,
  searchEntitySets,
  selectEntitySet,
  selectEntitySetById,
  selectEntitySetPage,
  setShowAssociationEntitySets
};
