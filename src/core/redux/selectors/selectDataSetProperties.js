/*
 * @flow
 */

import { List, Map, get } from 'immutable';
import { ValidationUtils } from 'lattice-utils';
import type { PropertyType, UUID } from 'lattice';

import selectAtlasDataSets from './selectAtlasDataSets';
import selectEntitySetPropertyTypes from './selectEntitySetPropertyTypes';

const { isValidUUID } = ValidationUtils;

export default function selectDataSetProperties(dataSetId :UUID) {

  return (state :Map) :Map<UUID, PropertyType | Map> => {

    if (isValidUUID(dataSetId)) {

      // atlas data set
      const atlasDataSets :Map<UUID, Map> = selectAtlasDataSets([dataSetId])(state);
      const dataSet :?Map = atlasDataSets.get(dataSetId);
      if (dataSet) {
        return Map().withMutations((mutableMap :Map<UUID, Map>) => {
          get(dataSet, 'columns', List()).forEach((column :Map) => {
            const columnId = get(column, 'id');
            mutableMap.set(columnId, column);
          });
        });
      }

      // entity set
      return selectEntitySetPropertyTypes(dataSetId)(state);
    }

    return Map();
  };
}
