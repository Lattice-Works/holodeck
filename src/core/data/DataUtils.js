/*
 * @flow
 */

import {
  Collection,
  Map,
  Set,
} from 'immutable';
import { Models } from 'lattice';
import { useSelector } from 'react-redux';

import { REDUCERS } from '../redux/constants';

const { EntitySet } = Models;
const { DATA } = REDUCERS;

const selectStoredEntityKeyIds = (entitySet :EntitySet, entityKeyIds :Set<UUID>) :Set<UUID> => (
  (state :Map) => (
    state
      .getIn([DATA, 'data', entitySet.organizationId, entitySet.id], Map())
      .keySeq()
      .filter((entityKeyId :UUID) => entityKeyIds.has(entityKeyId))
      .toSet()
  )
);

const useEntitySetData = (entitySet :EntitySet, entityKeyIds :Collection<UUID> | UUID[]) :Map => (
  useSelector((state :Map) => {
    const entitySetData :Map = state.getIn([DATA, 'data', entitySet.organizationId, entitySet.id], Map());
    return Map().withMutations((map) => {
      entityKeyIds.forEach((entityKeyId :UUID) => {
        map.set(entityKeyId, entitySetData.get(entityKeyId, Map()));
      });
    });
  })
);

export {
  selectStoredEntityKeyIds,
  useEntitySetData,
};
