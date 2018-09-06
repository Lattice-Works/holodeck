/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { EDM } from '../../utils/constants/StateConstants';
import { getFqnString } from '../../utils/DataUtils';
import {
  loadEdm
} from './EdmActionFactory';

const {
  EDM_WAS_LOADED,
  ENTITY_TYPES_BY_ID,
  ENTITY_TYPES_BY_FQN,
  PROPERTY_TYPES_BY_ID,
  PROPERTY_TYPES_BY_FQN
} = EDM;

const INITIAL_STATE :Map<> = fromJS({
  [EDM_WAS_LOADED]: false,
  [ENTITY_TYPES_BY_ID]: Map(),
  [ENTITY_TYPES_BY_FQN]: Map(),
  [PROPERTY_TYPES_BY_ID]: Map(),
  [PROPERTY_TYPES_BY_FQN]: Map()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadEdm.case(action.type): {
      return loadEdm.reducer(state, action, {
        SUCCESS: () => {
          const { propertyTypes, entityTypes } = action.value;

          let entityTypesById = Map();
          let entityTypesByFqn = Map();
          let propertyTypesById = Map();
          let propertyTypesByFqn = Map();

          /* Format entity types */
          fromJS(entityTypes).forEach((entityType) => {
            const id = entityType.get('id');
            const fqn = getFqnString(entityType.get('type'));
            entityTypesById = entityTypesById.set(id, entityType);
            entityTypesByFqn = entityTypesByFqn.set(fqn, entityType);
          });

          /* Format property types */
          fromJS(propertyTypes).forEach((propertyType) => {
            const id = propertyType.get('id');
            const fqn = getFqnString(propertyType.get('type'));
            propertyTypesById = propertyTypesById.set(id, propertyType);
            propertyTypesByFqn = propertyTypesByFqn.set(fqn, propertyType);
          });
          return state
            .set(ENTITY_TYPES_BY_ID, entityTypesById)
            .set(ENTITY_TYPES_BY_FQN, entityTypesByFqn)
            .set(PROPERTY_TYPES_BY_ID, propertyTypesById)
            .set(PROPERTY_TYPES_BY_FQN, propertyTypesByFqn)
            .set(EDM_WAS_LOADED, true);
        }
      });
    }

    default:
      return state;
  }
}

export default reducer;
