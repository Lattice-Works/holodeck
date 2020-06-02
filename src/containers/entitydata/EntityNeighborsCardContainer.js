/*
 * @flow
 */

import React, { useEffect, useMemo } from 'react';

import {
  List,
  Map,
  Set,
  get,
} from 'immutable';
import { Models } from 'lattice';
import {
  Card,
  CardSegment,
  Spinner,
  Table,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';

import { EntityDataRow, TableCardSegment, Title } from '../../components';
import { DataActions } from '../../core/data';
import { EDMUtils } from '../../core/edm';
import { REDUCERS } from '../../core/redux/constants';

const { EntitySet, PropertyType } = Models;

const { DATA } = REDUCERS;
const { FETCH_ENTITY_SET_DATA, fetchEntitySetData } = DataActions;
const { useEntityTypePropertyTypes } = EDMUtils;

type Props = {
  entitySet :EntitySet;
  neighbors :List<Map>;
};

const EntityNeighborsCardContainer = ({ entitySet, neighbors } :Props) => {

  /*
   * NOTE: performance issue against prod
   * /explore/entityData/77f1b8d0-9c75-4e52-8176-eb6913a74669/f7cc0000-0000-0000-8000-0000000070ab
   */

  const dispatch = useDispatch();
  const fetchEntitySetDataRS = useRequestState([DATA, FETCH_ENTITY_SET_DATA]);

  const entityKeyIds :Set<UUID> = useMemo(() => (
    Set().withMutations((set) => {
      if (neighbors) {
        neighbors.reduce((ids :Set<UUID>, neighbor :Map) => ids.add(get(neighbor, 'neighborId')), set);
      }
    })
  ), [neighbors]);

  // OPTIMIZE: no need to compute this on every render
  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(entitySet.entityTypeId);
  const tableHeaders = propertyTypes.map((propertyType) => ({
    key: propertyType.type.toString(),
    label: propertyType.title,
    sortable: false,
  }));

  // OPTIMIZE: no need to compute this on every render
  const entitySetData = useSelector((s) => s.getIn([DATA, 'entitySetDataMap', entitySet.id], Map()));
  const tableData = entitySetData
    .map((entity :Map, entityKeyId :UUID) => entity.set('id', entityKeyId))
    .toList()
    .toJS();

  const components = {
    Row: ({ data, headers } :Object) => (
      <EntityDataRow data={data} entitySetId={(entitySet.id :any)} headers={headers} />
    )
  };

  useEffect(() => {
    dispatch(fetchEntitySetData({ entityKeyIds, entitySetId: entitySet.id }));
  }, [dispatch, entityKeyIds, entitySet.id]);

  return (
    <Card>
      <CardSegment>
        <Title as="h3">{entitySet.title}</Title>
      </CardSegment>
      {
        fetchEntitySetDataRS === RequestStates.PENDING && (
          <CardSegment>
            <Spinner size="2x" />
          </CardSegment>
        )
      }
      {
        fetchEntitySetDataRS === RequestStates.SUCCESS && tableData && (
          <TableCardSegment>
            <Table
                components={components}
                data={tableData}
                headers={tableHeaders} />
          </TableCardSegment>
        )
      }
    </Card>
  );
};

export default EntityNeighborsCardContainer;
