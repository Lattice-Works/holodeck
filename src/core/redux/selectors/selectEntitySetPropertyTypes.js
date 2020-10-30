/*
 * @flow
 */

import { Map } from 'immutable';
import { ReduxUtils } from 'lattice-utils';
import type { EntityType, PropertyType, UUID } from 'lattice';

import selectEntitySetEntityType from './selectEntitySetEntityType';

const { selectPropertyTypes } = ReduxUtils;

export default function selectEntitySetPropertyTypes(entitySetId :UUID) {

  return (state :Map) :Map<UUID, PropertyType> => {

    const entityType :?EntityType = selectEntitySetEntityType(entitySetId)(state);
    return selectPropertyTypes(entityType?.properties)(state);
  };
}
