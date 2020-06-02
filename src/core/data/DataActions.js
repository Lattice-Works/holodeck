/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const FETCH_ENTITY_SET_DATA :'FETCH_ENTITY_SET_DATA' = 'FETCH_ENTITY_SET_DATA';
const fetchEntitySetData :RequestSequence = newRequestSequence(FETCH_ENTITY_SET_DATA);

export {
  FETCH_ENTITY_SET_DATA,
  fetchEntitySetData
};
