/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';

import { EDM } from '../../utils/constants/StateConstants';
import { getFqnString } from '../../utils/DataUtils';
import {
  loadPropertyTypes
} from './EdmActionFactory';

const {
  EDM_WAS_LOADED,
  PROPERTY_TYPES_BY_ID,
  PROPERTY_TYPES_BY_FQN
} = EDM;

const INITIAL_STATE :Map<> = fromJS({
  [EDM_WAS_LOADED]: false,
  [PROPERTY_TYPES_BY_ID]: Map(),
  [PROPERTY_TYPES_BY_FQN]: Map()
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case loadPropertyTypes.case(action.type): {
      return loadPropertyTypes.reducer(state, action, {
        SUCCESS: () => {
          let propertyTypesById = Map();
          let propertyTypesByFqn = Map();
          fromJS(action.value).forEach((propertyType) => {
            const id = propertyType.get('id');
            const fqn = getFqnString(propertyType.get('type'));
            propertyTypesById = propertyTypesById.set(id, propertyType);
            propertyTypesByFqn = propertyTypesByFqn.set(fqn, propertyType);
          });
          return state
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
