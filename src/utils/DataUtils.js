/*
* @flow
*/

import { Constants } from 'lattice';
import {
  List,
  Map,
  fromJS,
  isImmutable
} from 'immutable';

import { COUNT_FQN } from './constants/DataConstants';
import { PERSON_ENTITY_TYPE_FQN, PROPERTY_TYPES } from './constants/DataModelConstants';
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

export const groupNeighbors = (neighbors) => {
  let groupedNeighbors = Map();
  neighbors.forEach((neighbor) => {
    const assocId = neighbor.getIn(['associationEntitySet', 'id'], null);
    const neighborId = neighbor.getIn(['neighborEntitySet', 'id'], null);

    if (assocId && neighborId) {
      groupedNeighbors = groupedNeighbors.set(
        assocId,
        groupedNeighbors.get(assocId, Map()).set(
          neighborId,
          groupedNeighbors.getIn([assocId, neighborId], List()).push(neighbor)
        )
      );
    }
  });

  return groupedNeighbors;
};

export const getEntitySetPropertyTypes = ({ selectedEntitySet, entityTypesById, propertyTypesById }) => {
  if (!selectedEntitySet) {
    return List();
  }

  return entityTypesById
    .getIn([selectedEntitySet.get('entityTypeId'), 'properties'], List())
    .map(propertyTypeId => propertyTypesById.get(propertyTypeId));
};

export const isPersonType = (props) => {
  const { selectedEntitySet, entityTypesById, results } = props;
  let shouldShowPersonCard = false;

  if (!!selectedEntitySet && getFqnString(
    entityTypesById.getIn([selectedEntitySet.get('entityTypeId'), 'type'], Map())
  ) === PERSON_ENTITY_TYPE_FQN) {

    for (let i = 0; i < results.size; i += 1) {
      const entity = results.get(i);

      if (entity.get(PROPERTY_TYPES.FIRST_NAME, List()).size || entity.get(PROPERTY_TYPES.LAST_NAME, List()).size) {
        shouldShowPersonCard = true;
        i = results.size;
      }

    }
  }

  return shouldShowPersonCard;
};
