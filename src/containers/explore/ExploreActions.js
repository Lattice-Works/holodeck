/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const EXPLORE_ATLAS_DATA_SET :'EXPLORE_ATLAS_DATA_SET' = 'EXPLORE_ATLAS_DATA_SET';
const exploreAtlasDataSet :RequestSequence = newRequestSequence(EXPLORE_ATLAS_DATA_SET);

const EXPLORE_ENTITY_DATA :'EXPLORE_ENTITY_DATA' = 'EXPLORE_ENTITY_DATA';
const exploreEntityData :RequestSequence = newRequestSequence(EXPLORE_ENTITY_DATA);

const EXPLORE_ENTITY_NEIGHBORS :'EXPLORE_ENTITY_NEIGHBORS' = 'EXPLORE_ENTITY_NEIGHBORS';
const exploreEntityNeighbors :RequestSequence = newRequestSequence(EXPLORE_ENTITY_NEIGHBORS);

const EXPLORE_ENTITY_SET :'EXPLORE_ENTITY_SET' = 'EXPLORE_ENTITY_SET';
const exploreEntitySet :RequestSequence = newRequestSequence(EXPLORE_ENTITY_SET);

const EXPLORE_ORGANIZATION :'EXPLORE_ORGANIZATION' = 'EXPLORE_ORGANIZATION';
const exploreOrganization :RequestSequence = newRequestSequence(EXPLORE_ORGANIZATION);

export {
  EXPLORE_ATLAS_DATA_SET,
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_NEIGHBORS,
  EXPLORE_ENTITY_SET,
  EXPLORE_ORGANIZATION,
  exploreAtlasDataSet,
  exploreEntityData,
  exploreEntityNeighbors,
  exploreEntitySet,
  exploreOrganization,
};
