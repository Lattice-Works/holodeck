/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_NEIGHBOR_TYPES :string = 'GET_NEIGHBOR_TYPES';
const getNeighborTypes :RequestSequence = newRequestSequence(GET_NEIGHBOR_TYPES);

const GET_TOP_UTILIZERS :string = 'GET_TOP_UTILIZERS';
const getTopUtilizers :RequestSequence = newRequestSequence(GET_TOP_UTILIZERS);

export {
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  getNeighborTypes,
  getTopUtilizers
};
