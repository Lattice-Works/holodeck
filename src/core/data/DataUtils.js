/*
 * @flow
 */

import {
  Map,
  Set,
  getIn,
  has,
} from 'immutable';
import { Constants } from 'lattice';

import { REDUCERS } from '../redux/constants';

const { OPENLATTICE_ID_FQN } = Constants;

const { DATA } = REDUCERS;

const getEntityKeyId = (entity :Map | Object) :?UUID => (
  getIn(entity, [OPENLATTICE_ID_FQN, 0])
);

const selectEntitySetData = (entitySetId :UUID, entityKeyIds :Set<UUID> | UUID[]) => (
  (state :Map) :Map => (
    state
      .getIn([DATA, 'entitySetDataMap', entitySetId], Map())
      .filter((entityData :Map, entityKeyId :UUID) => has(entityKeyIds, entityKeyId))
  )
);

export {
  getEntityKeyId,
  selectEntitySetData,
};
