/*
 * @flow
 */

import {
  Collection,
  Map,
  Set,
  getIn,
} from 'immutable';
import { Constants } from 'lattice';
import { useSelector } from 'react-redux';

import { REDUCERS } from '../redux/constants';

const { OPENLATTICE_ID_FQN } = Constants;

const { DATA } = REDUCERS;

const getEntityKeyId = (entity :Map | Object) :?UUID => (
  getIn(entity, [OPENLATTICE_ID_FQN, 0])
);

const selectStoredEntityKeyIds = (entitySetId :UUID, entityKeyIds :Set<UUID>) :Set<UUID> => (
  (state :Map) => (
    state
      .getIn([DATA, 'entitySetDataMap', entitySetId], Map())
      .keySeq()
      .filter((entityKeyId :UUID) => entityKeyIds.has(entityKeyId))
      .toSet()
  )
);

const useEntitySetData = (entitySetId :UUID, entityKeyIds :Collection<UUID> | UUID[]) :Map => (
  useSelector((state :Map) => {
    const entitySetData :Map = state.getIn([DATA, 'entitySetDataMap', entitySetId], Map());
    return Map().withMutations((map) => {
      entityKeyIds.forEach((entityKeyId :UUID) => {
        map.set(entityKeyId, entitySetData.get(entityKeyId, Map()));
      });
    });
  })
);

export {
  getEntityKeyId,
  selectStoredEntityKeyIds,
  useEntitySetData,
};
