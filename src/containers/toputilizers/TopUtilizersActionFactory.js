/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CHANGE_TOP_UTILIZERS_DISPLAY :string = 'CHANGE_TOP_UTILIZERS_DISPLAY';
const changeTopUtilizersDisplay :RequestSequence = newRequestSequence(CHANGE_TOP_UTILIZERS_DISPLAY);

const CLEAR_TOP_UTILIZERS :string = 'CLEAR_TOP_UTILIZERS';
const clearTopUtilizers :RequestSequence = newRequestSequence(CLEAR_TOP_UTILIZERS);

const GET_NEIGHBOR_TYPES :string = 'GET_NEIGHBOR_TYPES';
const getNeighborTypes :RequestSequence = newRequestSequence(GET_NEIGHBOR_TYPES);

const GET_TOP_UTILIZERS :string = 'GET_TOP_UTILIZERS';
const getTopUtilizers :RequestSequence = newRequestSequence(GET_TOP_UTILIZERS);

const LOAD_TOP_UTILIZER_NEIGHBORS :string = 'LOAD_TOP_UTILIZER_NEIGHBORS';
const loadTopUtilizerNeighbors :RequestSequence = newRequestSequence(LOAD_TOP_UTILIZER_NEIGHBORS);

export {
  CHANGE_TOP_UTILIZERS_DISPLAY,
  CLEAR_TOP_UTILIZERS,
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  LOAD_TOP_UTILIZER_NEIGHBORS,
  changeTopUtilizersDisplay,
  clearTopUtilizers,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors
};
