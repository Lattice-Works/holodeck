/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_ENTITY_NEIGHBORS :string = 'LOAD_ENTITY_NEIGHBORS';
const loadEntityNeighbors :RequestSequence = newRequestSequence(LOAD_ENTITY_NEIGHBORS);

const SELECT_BREADCRUMB :string = 'SELECT_BREADCRUMB';
const selectBreadcrumb :RequestSequence = newRequestSequence(SELECT_BREADCRUMB);

const SELECT_ENTITY :string = 'SELECT_ENTITY';
const selectEntity :RequestSequence = newRequestSequence(SELECT_ENTITY);

export {
  LOAD_ENTITY_NEIGHBORS,
  SELECT_BREADCRUMB,
  SELECT_ENTITY,
  loadEntityNeighbors,
  selectBreadcrumb,
  selectEntity
};
