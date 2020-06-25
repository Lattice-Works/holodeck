/*
 * @flow
 */

import { Map, Set, isCollection } from 'immutable';
import { Models } from 'lattice';
import { LangUtils, ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';

import { REDUCERS } from '../redux/constants';

const { isValidUUID } = ValidationUtils;
const { isNonEmptyArray, isNonEmptyString } = LangUtils;
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

type IdsOrNames =
  | UUID[]
  | string[]
  | Set<UUID>
  | Set<string>;

// OPTIMIZE / MEMOIZE
const useEntitySets = (idsOrNames :?IdsOrNames) :{ [UUID] :EntitySet } => (
  useSelector((state :Map) => {

    const isValid = (
      (isNonEmptyArray(idsOrNames) || isCollection(idsOrNames))
      && (
        idsOrNames.every(isValidUUID) || idsOrNames.every(isNonEmptyString)
      )
    );

    if (!isValid || !idsOrNames) {
      return {};
    }

    const entitySetsMap = {};
    idsOrNames.forEach((idOrName) => {
      const entitySetIndex :number = state.getIn(['edm', 'entitySetsIndexMap', idOrName], -1);
      if (entitySetIndex >= 0) {
        const entitySet :?EntitySet = state.getIn(['edm', 'entitySets', entitySetIndex]);
        if (entitySet && entitySet.id) {
          entitySetsMap[entitySet.id] = entitySet;
        }
      }
    });

    return entitySetsMap;
  })
);

// OPTIMIZE / MEMOIZE
const useEntityTypePropertyTypes = (idOrFQN :?UUID | FQN) :PropertyType[] => (
  useSelector((state :Map) => {

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
  })
);

export {
  selectEntitySet,
  useEntitySets,
  useEntityTypePropertyTypes,
};
