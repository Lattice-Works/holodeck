/*
 * @flow
 */

import { Map } from 'immutable';
import { ReduxUtils } from 'lattice-utils';
import type { EntitySet, EntityType, UUID } from 'lattice';

const { selectEntitySets, selectEntityTypes } = ReduxUtils;

export default function selectEntitySetEntityType(entitySetId :UUID) {

  return (state :Map) :?EntityType => {

    const entitySets :Map<UUID, EntitySet> = selectEntitySets([entitySetId])(state);
    const entitySet :?EntitySet = entitySets.get(entitySetId);
    const entityTypeId :?UUID = entitySet?.entityTypeId;
    const entityTypes :Map<UUID, EntityType> = selectEntityTypes([entityTypeId])(state);
    const entityType :?EntityType = entityTypes.get(entityTypeId);
    return entityType;
  };
}
