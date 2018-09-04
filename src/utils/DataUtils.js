/*
* @flow
*/

import { Constants } from 'lattice';

import { COUNT_FQN } from './constants/DataConstants';

const { OPENLATTICE_ID_FQN } = Constants;

export const getFqnObj = (fqnStr) => {
  const splitStr = fqnStr.split('.');
  return {
    namespace: splitStr[0],
    name: splitStr[1]
  };
};

export const getFqnString = (fqn) => {
  const { namespace, name } = fqn;
  return `${namespace}.${name}`;
};

export const getEntityKeyId = entity => entity.getIn([OPENLATTICE_ID_FQN, 0]);
