/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const CLEAR_EXPLORE_SEARCH_RESULTS :string = 'CLEAR_EXPLORE_SEARCH_RESULTS';
const clearExploreSearchResults :RequestSequence = newRequestSequence(CLEAR_EXPLORE_SEARCH_RESULTS);

const LOAD_ENTITY_NEIGHBORS :string = 'LOAD_ENTITY_NEIGHBORS';
const loadEntityNeighbors :RequestSequence = newRequestSequence(LOAD_ENTITY_NEIGHBORS);

const RE_INDEX_ENTITIES_BY_ID :string = 'RE_INDEX_ENTITIES_BY_ID';
const reIndexEntitiesById :RequestSequence = newRequestSequence(RE_INDEX_ENTITIES_BY_ID);

const SEARCH_ENTITY_SET_DATA :string = 'SEARCH_ENTITY_SET_DATA';
const searchEntitySetData :RequestSequence = newRequestSequence(SEARCH_ENTITY_SET_DATA);

const SELECT_BREADCRUMB :string = 'SELECT_BREADCRUMB';
const selectBreadcrumb :RequestSequence = newRequestSequence(SELECT_BREADCRUMB);

const SELECT_ENTITY :string = 'SELECT_ENTITY';
const selectEntity :RequestSequence = newRequestSequence(SELECT_ENTITY);

const UNMOUNT_EXPLORE :string = 'UNMOUNT_EXPLORE';
const unmountExplore :RequestSequence = newRequestSequence(UNMOUNT_EXPLORE);

const UPDATE_FILTERED_TYPES :string = 'UPDATE_FILTERED_TYPES';
const updateFilteredTypes :RequestSequence = newRequestSequence(UPDATE_FILTERED_TYPES);

export {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  LOAD_ENTITY_NEIGHBORS,
  RE_INDEX_ENTITIES_BY_ID,
  SEARCH_ENTITY_SET_DATA,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  UNMOUNT_EXPLORE,
  UPDATE_FILTERED_TYPES,
  clearExploreSearchResults,
  loadEntityNeighbors,
  reIndexEntitiesById,
  searchEntitySetData,
  selectBreadcrumb,
  selectEntity,
  unmountExplore,
  updateFilteredTypes
};
