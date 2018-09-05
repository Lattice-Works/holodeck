/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const CLEAR_TOP_UTILIZERS :string = 'CLEAR_TOP_UTILIZERS';
const clearTopUtilizers :RequestSequence = newRequestSequence(CLEAR_TOP_UTILIZERS);

const GET_NEIGHBOR_TYPES :string = 'GET_NEIGHBOR_TYPES';
const getNeighborTypes :RequestSequence = newRequestSequence(GET_NEIGHBOR_TYPES);

const GET_TOP_UTILIZERS :string = 'GET_TOP_UTILIZERS';
const getTopUtilizers :RequestSequence = newRequestSequence(GET_TOP_UTILIZERS);

export {
  CLEAR_TOP_UTILIZERS,
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  clearTopUtilizers,
  getNeighborTypes,
  getTopUtilizers
};
