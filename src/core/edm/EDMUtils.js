/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';

import { REDUCERS } from '../redux/constants';

const { isValidUUID } = ValidationUtils;
const {
  EntitySet,
  EntityType,
  FQN,
  PropertyType,
} = Models;

const { EDM } = REDUCERS;

const selectEntitySet = (idOrName :UUID | string) => (state :Map) :?EntitySet => {
  if (state.hasIn([EDM, 'entitySetsIndexMap', idOrName])) {
    const index :number = state.getIn([EDM, 'entitySetsIndexMap', idOrName]);
    if (state.hasIn([EDM, 'entitySets', index])) {
      return state.getIn([EDM, 'entitySets', index]);
    }
  }
  return undefined;
};

const useEntityTypePropertyTypes = (idOrFQN :?UUID | FQN) => {

  const propertyTypes :PropertyType[] = useSelector((state :Map) => {

    if (isValidUUID(idOrFQN) || FQN.isValid(idOrFQN)) {

      const entityTypeIndex :?number = state.getIn(['edm', 'entityTypesIndexMap', idOrFQN], -1);
      if (entityTypeIndex === -1) {
        return [];
      }

      const entityType :?EntityType = state.getIn(['edm', 'entityTypes', entityTypeIndex]);
      if (!entityType || !entityType.properties) {
        return [];
      }

      return entityType.properties.map((propertyTypeId :UUID) => {
        const propertyTypeIndex :number = state.getIn(['edm', 'propertyTypesIndexMap', propertyTypeId]);
        return state.getIn(['edm', 'propertyTypes', propertyTypeIndex]);
      });
    }

    return [];
  });

  return propertyTypes;
};

export {
  selectEntitySet,
  useEntityTypePropertyTypes,
};
