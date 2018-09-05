/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_ENTITY_NEIGHBORS :string = 'LOAD_ENTITY_NEIGHBORS';
const loadEntityNeighbors :RequestSequence = newRequestSequence(LOAD_ENTITY_NEIGHBORS);

export {
  LOAD_ENTITY_NEIGHBORS,
  loadEntityNeighbors
};
