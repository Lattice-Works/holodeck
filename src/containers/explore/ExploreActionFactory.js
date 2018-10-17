/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_EXPLORE_SEARCH_RESULTS :string = 'CLEAR_EXPLORE_SEARCH_RESULTS';
const clearExploreSearchResults :RequestSequence = newRequestSequence(CLEAR_EXPLORE_SEARCH_RESULTS);

const LOAD_ENTITY_NEIGHBORS :string = 'LOAD_ENTITY_NEIGHBORS';
const loadEntityNeighbors :RequestSequence = newRequestSequence(LOAD_ENTITY_NEIGHBORS);

const SEARCH_ENTITY_SET_DATA :string = 'SEARCH_ENTITY_SET_DATA';
const searchEntitySetData :RequestSequence = newRequestSequence(SEARCH_ENTITY_SET_DATA);

const SELECT_BREADCRUMB :string = 'SELECT_BREADCRUMB';
const selectBreadcrumb :RequestSequence = newRequestSequence(SELECT_BREADCRUMB);

const SELECT_ENTITY :string = 'SELECT_ENTITY';
const selectEntity :RequestSequence = newRequestSequence(SELECT_ENTITY);

const UNMOUNT_EXPLORE :string = 'UNMOUNT_EXPLORE';
const unmountExplore :RequestSequence = newRequestSequence(UNMOUNT_EXPLORE);

export {
  CLEAR_EXPLORE_SEARCH_RESULTS,
  LOAD_ENTITY_NEIGHBORS,
  SEARCH_ENTITY_SET_DATA,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  UNMOUNT_EXPLORE,
  clearExploreSearchResults,
  loadEntityNeighbors,
  searchEntitySetData,
  selectBreadcrumb,
  selectEntity,
  unmountExplore
};
