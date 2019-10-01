/*
 * @flow
 */

import { newRequestSequence } from 'redux-reqseq';
import type { RequestSequence } from 'redux-reqseq';

const GET_EDM_TYPES :'GET_EDM_TYPES' = 'GET_EDM_TYPES';
const getEntityDataModelTypes :RequestSequence = newRequestSequence(GET_EDM_TYPES);

const GET_ENTITY_SETS_WITH_METADATA :'GET_ENTITY_SETS_WITH_METADATA' = 'GET_ENTITY_SETS_WITH_METADATA';
const getEntitySetsWithMetaData :RequestSequence = newRequestSequence(GET_ENTITY_SETS_WITH_METADATA);

export {
  GET_EDM_TYPES,
  GET_ENTITY_SETS_WITH_METADATA,
  getEntityDataModelTypes,
  getEntitySetsWithMetaData,
};
