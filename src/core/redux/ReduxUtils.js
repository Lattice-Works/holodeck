/*
 * @flow
 */

import { List, Map, getIn } from 'immutable';
import { Models } from 'lattice';

import { REDUCERS } from './constants';

const { EntitySet, Organization } = Models;
const { EDM, ORGS } = REDUCERS;

const selectAtlasDataSet = (organizationId :UUID, atlasDataSetId :UUID) => (state :Map) :?Map => {
  // TODO: avoid .find()
  return state
    .getIn([ORGS, 'atlasDataSets', organizationId], List())
    .find((atlasDataSet :Map) => getIn(atlasDataSet, ['table', 'id']) === atlasDataSetId);
};

const selectEntitySet = (idOrName :UUID | string) => (state :Map) :?EntitySet => {
  if (state.hasIn([EDM, 'entitySetsIndexMap', idOrName])) {
    const index :number = state.getIn([EDM, 'entitySetsIndexMap', idOrName]);
    if (state.hasIn([EDM, 'entitySets', index])) {
      return state.getIn([EDM, 'entitySets', index]);
    }
  }
  return undefined;
};

const selectOrganization = (organizationId :UUID) => (state :Map) :?Organization => {
  if (state.hasIn([ORGS, 'organizations', organizationId])) {
    return state.getIn([ORGS, 'organizations', organizationId]);
  }
  return undefined;
};

export {
  selectAtlasDataSet,
  selectOrganization,
  selectEntitySet,
};
