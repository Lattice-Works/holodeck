/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CHANGE_NUM_UTILIZERS :string = 'CHANGE_NUM_UTILIZERS';
const changeNumUtilizers :RequestSequence = newRequestSequence(CHANGE_NUM_UTILIZERS);

const CHANGE_TOP_UTILIZERS_DISPLAY :string = 'CHANGE_TOP_UTILIZERS_DISPLAY';
const changeTopUtilizersDisplay :RequestSequence = newRequestSequence(CHANGE_TOP_UTILIZERS_DISPLAY);

const CLEAR_TOP_UTILIZERS_RESULTS :string = 'CLEAR_TOP_UTILIZERS_RESULTS';
const clearTopUtilizersResults :RequestSequence = newRequestSequence(CLEAR_TOP_UTILIZERS_RESULTS);

const DOWNLOAD_TOP_UTILIZERS :string = 'DOWNLOAD_TOP_UTILIZERS';
const downloadTopUtilizers :RequestSequence = newRequestSequence(DOWNLOAD_TOP_UTILIZERS);

const GET_NEIGHBOR_TYPES :string = 'GET_NEIGHBOR_TYPES';
const getNeighborTypes :RequestSequence = newRequestSequence(GET_NEIGHBOR_TYPES);

const GET_TOP_UTILIZERS :string = 'GET_TOP_UTILIZERS';
const getTopUtilizers :RequestSequence = newRequestSequence(GET_TOP_UTILIZERS);

const LOAD_TOP_UTILIZER_NEIGHBORS :string = 'LOAD_TOP_UTILIZER_NEIGHBORS';
const loadTopUtilizerNeighbors :RequestSequence = newRequestSequence(LOAD_TOP_UTILIZER_NEIGHBORS);

const UNMOUNT_TOP_UTILIZERS :string = 'UNMOUNT_TOP_UTILIZERS';
const unmountTopUtilizers :RequestSequence = newRequestSequence(UNMOUNT_TOP_UTILIZERS);

export {
  CHANGE_NUM_UTILIZERS,
  CHANGE_TOP_UTILIZERS_DISPLAY,
  CLEAR_TOP_UTILIZERS_RESULTS,
  DOWNLOAD_TOP_UTILIZERS,
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  LOAD_TOP_UTILIZER_NEIGHBORS,
  UNMOUNT_TOP_UTILIZERS,
  changeNumUtilizers,
  changeTopUtilizersDisplay,
  clearTopUtilizersResults,
  downloadTopUtilizers,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors,
  unmountTopUtilizers
};
