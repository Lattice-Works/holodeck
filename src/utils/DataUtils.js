/*
* @flow
*/

import { Constants } from 'lattice';
import { Map, fromJS, isImmutable } from 'immutable';

import { COUNT_FQN } from './constants/DataConstants';
import { TOP_UTILIZERS_FILTER } from './constants/TopUtilizerConstants';

const {
  ASSOC_ID,
  ASSOC_TITLE,
  NEIGHBOR_ID,
  NEIGHBOR_TITLE,
  IS_SRC,
  VALUE,
  LABEL
} = TOP_UTILIZERS_FILTER;

const { OPENLATTICE_ID_FQN } = Constants;

export const getFqnObj = (fqnStr) => {
  const splitStr = fqnStr.split('.');
  return {
    namespace: splitStr[0],
    name: splitStr[1]
  };
};

export const getFqnString = (fqn) => {
  let { namespace, name } = fqn;
  if (isImmutable(fqn)) {
    namespace = fqn.get('namespace');
    name = fqn.get('name');
  }
  return `${namespace}.${name}`;
};

export const getEntityKeyId = entity => entity.getIn([OPENLATTICE_ID_FQN, 0]);

export const getNeighborCountsForFilters = (filters, neighbors) => {
  let counts = Map();
  filters.forEach((filter) => {
    counts = counts.setIn([filter.get(ASSOC_ID), filter.get(NEIGHBOR_ID)], 0);
  });

  neighbors.forEach((neighbor) => {
    const assocTypeId = neighbor.getIn(['associationEntitySet', 'entityTypeId'], null);
    const neighborTypeId = neighbor.getIn(['neighborEntitySet', 'entityTypeId'], null);
    const prevCount = counts.getIn([assocTypeId, neighborTypeId], null);
    if (assocTypeId !== null && neighborTypeId !== null && prevCount !== null) {
      counts = counts.setIn([assocTypeId, neighborTypeId], prevCount + 1);
    }
  });

  return filters.map(filter => fromJS({
    [COUNT_FQN]: counts.getIn([filter.get(ASSOC_ID), filter.get(NEIGHBOR_ID)]),
    [LABEL]: filter.get(LABEL)
  }));

};
