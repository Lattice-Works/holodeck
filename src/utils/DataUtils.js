import { Constants, Models } from 'lattice';
import { List, Map, fromJS } from 'immutable';

import { COUNT_FQN } from './constants/DataConstants';
import { PERSON_ENTITY_TYPE_FQN, PROPERTY_TYPES } from './constants/DataModelConstants';
import { TOP_UTILIZERS_FILTER } from './constants/TopUtilizerConstants';

const {
  ASSOC_ID,
  NEIGHBOR_ID,
  LABEL
} = TOP_UTILIZERS_FILTER;

const { OPENLATTICE_ID_FQN } = Constants;
const { FullyQualifiedName } = Models;

export const getEntityKeyId = (entity) => entity.getIn([OPENLATTICE_ID_FQN, 0]);

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

  return filters.map((filter) => fromJS({
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

export const getEntitySetPropertyTypes = ({
  entityTypes,
  entityTypesIndexMap,
  propertyTypes,
  propertyTypesIndexMap,
  selectedEntitySet,
}) => {

  if (!selectedEntitySet) {
    return List();
  }

  const entityTypeId = selectedEntitySet.get('entityTypeId');
  const entityTypeIndex = entityTypesIndexMap.get(entityTypeId);
  const entityType = entityTypes.get(entityTypeIndex, Map());

  return entityType
    .get('properties', List())
    .map((propertyTypeId) => {
      const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
      return propertyTypes.get(propertyTypeIndex, Map());
    });
};

export const isPersonType = (props) => {

  const {
    selectedEntitySet,
    entityTypes,
    entityTypesIndexMap,
    results,
  } = props;
  let shouldShowPersonCard = false;

  const entityTypeId = selectedEntitySet.get('entityTypeId');
  const entityTypeIndex = entityTypesIndexMap.get(entityTypeId);
  const entityType = entityTypes.get(entityTypeIndex, Map());
  const entityTypeFQN = FullyQualifiedName.toString(entityType.get('type'));

  if (!!selectedEntitySet && entityTypeFQN === PERSON_ENTITY_TYPE_FQN) {

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
