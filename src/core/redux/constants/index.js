/*
 * @flow
 */

import { ReduxConstants } from 'lattice-utils';

export const {
  APP,
  AUTH,
  DATA,
  EDM,
  ENTITY_SETS,
  ENTITY_SETS_INDEX_MAP,
  ENTITY_TYPES,
  ENTITY_TYPES_INDEX_MAP,
  ERROR,
  HITS,
  MEMBERS,
  ORGANIZATIONS,
  ORGS,
  PAGE,
  PERMISSIONS,
  PROPERTY_TYPES,
  PROPERTY_TYPES_INDEX_MAP,
  QUERY,
  REQUEST_STATE,
  SEARCH,
  TOTAL_HITS,
  USERS,
} = ReduxConstants;

export const ATLAS_DATA_SETS :'atlasDataSets' = 'atlasDataSets';
export const EXPLORE :'explore' = 'explore';

const REDUCERS = {
  APP,
  DATA,
  EDM,
  EXPLORE,
  ORGS,
  SEARCH,
};

export {
  REDUCERS,
};
