/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_PROPERTY_TYPES :string = 'LOAD_PROPERTY_TYPES';
const loadPropertyTypes :RequestSequence = newRequestSequence(LOAD_PROPERTY_TYPES);

export {
  LOAD_PROPERTY_TYPES,
  loadPropertyTypes
};
