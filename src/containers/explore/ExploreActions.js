/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EXPLORE_ENTITY_DATA :'EXPLORE_ENTITY_DATA' = 'EXPLORE_ENTITY_DATA';
const exploreEntityData :RequestSequence = newRequestSequence(EXPLORE_ENTITY_DATA);

const EXPLORE_ENTITY_SET :'EXPLORE_ENTITY_SET' = 'EXPLORE_ENTITY_SET';
const exploreEntitySet :RequestSequence = newRequestSequence(EXPLORE_ENTITY_SET);

export {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_SET,
  exploreEntityData,
  exploreEntitySet,
};
