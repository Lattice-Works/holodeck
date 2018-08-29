/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const GET_TOP_UTILIZERS :string = 'GET_TOP_UTILIZERS';
const getTopUtilizers :RequestSequence = newRequestSequence(GET_TOP_UTILIZERS);

export {
  GET_TOP_UTILIZERS,
  getTopUtilizers
};
