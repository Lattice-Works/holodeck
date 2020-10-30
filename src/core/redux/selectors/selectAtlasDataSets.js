/*
 * @flow
 */

import _isArray from 'lodash/isArray';
import {
  Map,
  Set,
  getIn,
  isCollection,
} from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { UUID } from 'lattice';

import { ATLAS_DATA_SETS, EDM } from '../constants';

const { isValidUUID } = ValidationUtils;

export default function selectAtlasDataSets(ids :Set<UUID> | Array<UUID>) {

  return (state :Map) :Map<UUID, Map> => {

    if (!_isArray(ids) && !isCollection(ids)) {
      return Map();
    }

    const entitySetsMap = Map().withMutations((map :Map) => {
      ids.forEach((id) => {
        if (isValidUUID(id)) {
          const dataSet = getIn(state, [EDM, ATLAS_DATA_SETS, id]);
          if (dataSet) {
            map.set(id, dataSet);
          }
        }
      });
    });

    return entitySetsMap;
  };
}
