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
  ENTITY_SETS_BY_ID,
  ENTITY_SET_METADATA_BY_ID,
  ENTITY_TYPES_BY_ID,
  ENTITY_TYPES_BY_FQN,
  IS_LOADING_EDM,
  PROPERTY_TYPES_BY_ID,
  PROPERTY_TYPES_BY_FQN
} = EDM;

const INITIAL_STATE :Map<> = fromJS({
  [EDM_WAS_LOADED]: false,
  [ENTITY_SETS_BY_ID]: Map(),
  [ENTITY_SET_METADATA_BY_ID]: Map(),
  [ENTITY_TYPES_BY_ID]: Map(),
  [ENTITY_TYPES_BY_FQN]: Map(),
  [IS_LOADING_EDM]: false,
  [PROPERTY_TYPES_BY_ID]: Map(),
  [PROPERTY_TYPES_BY_FQN]: Map()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadEdm.case(action.type): {
      return loadEdm.reducer(state, action, {
        REQUEST: () => state.set(IS_LOADING_EDM, true),
        SUCCESS: () => {
          const {
            entitySets,
            entityTypes,
            propertyTypes,
            entitySetMetadata
          } = action.value;

          let entitySetsById = Map();
          let entityTypesById = Map();
          let entityTypesByFqn = Map();
          let propertyTypesById = Map();
          let propertyTypesByFqn = Map();

          /* Format entity sets */
          fromJS(entitySets).forEach((entitySet) => {
            const id = entitySet.get('id');
            entitySetsById = entitySetsById.set(id, entitySet);
          });

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
            .set(ENTITY_SETS_BY_ID, entitySetsById)
            .set(ENTITY_TYPES_BY_ID, entityTypesById)
            .set(ENTITY_TYPES_BY_FQN, entityTypesByFqn)
            .set(PROPERTY_TYPES_BY_ID, propertyTypesById)
            .set(PROPERTY_TYPES_BY_FQN, propertyTypesByFqn)
            .set(ENTITY_SET_METADATA_BY_ID, fromJS(entitySetMetadata))
            .set(EDM_WAS_LOADED, true);
        },
        FINALLY: () => state.set(IS_LOADING_EDM, false)
      });
    }

    default:
      return state;
  }
}

export default reducer;
