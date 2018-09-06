/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';

const LOAD_EDM :string = 'LOAD_EDM';
const loadEdm :RequestSequence = newRequestSequence(LOAD_EDM);

export {
  LOAD_EDM,
  loadEdm
};
