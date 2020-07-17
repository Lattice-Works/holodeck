/*
 * @flow
 */

import React, { useEffect, useMemo, useState } from 'react';

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
  PaginationToolbar,
  Spinner,
  Table,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import {
  EntityDataRow,
  Header,
  SpinnerOverlay,
  TableCardSegment,
} from '../../components';
import { DataActions, DataUtils } from '../../core/data';
import { EDMUtils } from '../../core/edm';
import { ReduxActions } from '../../core/redux';
import { REDUCERS } from '../../core/redux/constants';
import { MAX_HITS_10 } from '../../core/search/constants';

const { resetRequestState } = ReduxActions;

const { EntitySet, PropertyType } = Models;

const { DATA } = REDUCERS;
const { FETCH_ENTITY_SET_DATA, fetchEntitySetData } = DataActions;
const { useEntitySetData } = DataUtils;
const { useEntityTypePropertyTypes } = EDMUtils;

type Props = {
  entitySet :EntitySet;
  neighbors :List<Map>;
};

const EntityNeighborsCardContainer = ({ entitySet, neighbors } :Props) => {

  const entitySetId :UUID = (entitySet.id :any);

  /*
   * NOTE: performance issue against prod
   * /explore/entityData/77f1b8d0-9c75-4e52-8176-eb6913a74669/f7cc0000-0000-0000-8000-0000000070ab
   */

  const dispatch = useDispatch();
  const [tableData, setTableData] = useState([]);
  const [tablePage, setTablePage] = useState(0);
  const [neighborsIndex, setNeighborsIndex] = useState(0);
  const fetchEntitySetDataRS :?RequestState = useRequestState([DATA, FETCH_ENTITY_SET_DATA, entitySetId]);

  const entityKeyIds :List<UUID> = useMemo(() => (
    List().withMutations((list) => {
      if (neighbors) {
        neighbors
          .slice(neighborsIndex, neighborsIndex + MAX_HITS_10)
          .reduce((ids :List<UUID>, neighbor :Map) => ids.push(get(neighbor, 'neighborId')), list);
      }
    })
  ), [neighbors, neighborsIndex]);

  const totalNeighbors :number = useMemo(() => (
    neighbors ? neighbors.count() : 0
  ), [neighbors]);

  // OPTIMIZE: no need to compute this on every render
  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(entitySet.entityTypeId);

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = propertyTypes.map((propertyType) => ({
    key: propertyType.type.toString(),
    label: `${propertyType.title} (${propertyType.type.toString()})`,
    sortable: false,
  }));

  // OPTIMIZE: no need to compute this on every render
  const entitySetData :Map = useEntitySetData(entitySetId, entityKeyIds);

  useEffect(() => {
    if (fetchEntitySetDataRS === RequestStates.SUCCESS) {
      const newTableData = entityKeyIds
        .map((entityKeyId :UUID, index :number) => (
          // 'id' is used as the "key" prop in the table component, so it needs to be unique
          entitySetData.get(entityKeyId).set('id', `${entityKeyId}-${index}`)
        ))
        .toJS(); // TODO: avoid .toJS()
      setTableData(newTableData);
    }
  // NOTE: leaving out "entitySetData" from depedency array because it tends to cause infinite renders
  // TODO: figure out how to avoid the infinite renders when "entitySetData" is passed
  }, [entityKeyIds, fetchEntitySetDataRS]);

  useEffect(() => {
    dispatch(
      fetchEntitySetData({
        entitySetId,
        entityKeyIds: Set(entityKeyIds),
      })
    );
  }, [dispatch, entityKeyIds, entitySetId]);

  const handleOnPageChange = ({ page, start }) => {
    setTablePage(page);
    setNeighborsIndex(start);
    dispatch(resetRequestState([FETCH_ENTITY_SET_DATA, entitySetId]));
  };

  const components = {
    Row: ({ data, headers } :Object) => (
      <EntityDataRow data={data} entitySetId={entitySetId} headers={headers} />
    )
  };

  return (
    <Card>
      <CardSegment>
        <Header as="h3">{entitySet.title}</Header>
      </CardSegment>
      {
        fetchEntitySetDataRS === RequestStates.PENDING && (
          <SpinnerOverlay>
            <Spinner size="2x" />
          </SpinnerOverlay>
        )
      }
      <CardSegment borderless padding="2px 30px">
        <PaginationToolbar
            page={tablePage}
            count={totalNeighbors}
            onPageChange={handleOnPageChange}
            rowsPerPage={MAX_HITS_10} />
      </CardSegment>
      <TableCardSegment borderless padding="0 30px" noWrap>
        <Table
            components={components}
            data={tableData}
            headers={tableHeaders} />
      </TableCardSegment>
      <CardSegment padding="2px 30px 30px 30px">
        <PaginationToolbar
            page={tablePage}
            count={totalNeighbors}
            onPageChange={handleOnPageChange}
            rowsPerPage={MAX_HITS_10} />
      </CardSegment>
    </Card>
  );
};

export default EntityNeighborsCardContainer;
