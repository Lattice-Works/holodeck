/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { useSelector } from 'react-redux';

import { ValidationUtils } from '../../utils';

const { FQN, EntityType, PropertyType } = Models;

const useEntityTypePropertyTypes = (idOrFQN :?UUID | FQN) => {

  const propertyTypes :PropertyType[] = useSelector((state :Map) => {

    if (ValidationUtils.isValidUUID(idOrFQN) || FQN.isValid(idOrFQN)) {

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
  useEntityTypePropertyTypes,
};
