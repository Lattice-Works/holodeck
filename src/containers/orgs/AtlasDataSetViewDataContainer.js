/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map } from 'immutable';
import { DataSetsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  PaginationToolbar,
  SearchButton,
  SearchInput,
  Spinner,
  Table,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import {
  BasicErrorComponent,
  EntityDataRow,
  SpinnerOverlay,
  TableCardSegment,
} from '../../components';
import { REDUCERS } from '../../core/redux/constants';

const { getOrganizationDataSetData } = DataSetsApiActions;
const { ORGS } = REDUCERS;

type Props = {
  atlasDataSet :Map;
  atlasDataSetId :UUID;
  organizationId :UUID;
};

const AtlasDataSetViewDataContainer = ({ atlasDataSet, atlasDataSetId, organizationId } :Props) => {

  const dispatch = useDispatch();

  const data :Map = useSelector((s) => s.getIn([ORGS, 'atlasDataSetData', organizationId, atlasDataSetId], Map()));

  useEffect(() => {
    dispatch(
      getOrganizationDataSetData({
        organizationId,
        count: 100,
        dataSetId: atlasDataSetId,
      })
    );
  }, [dispatch, organizationId, atlasDataSetId]);

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = atlasDataSet
    .get('columns', List())
    .map((column) => ({
      key: column.get('id'),
      label: `${column.get('title') || column.get('name')}${column.get('primaryKey') ? ' (PK)' : ''}`,
      sortable: false,
    }))
    .toJS();

  // OPTIMIZE: no need to compute this on every render
  const tableData = List()
    .withMutations((list :List) => {
      data.forEach((columnValues :List, columnId :UUID) => {
        columnValues.forEach((value :any, rowIndex :number) => {
          list.update(rowIndex, (row :Map = Map()) => row.set(columnId, value));
        });
      });
    })
    .map((row) => row.set('id', row.hashCode())) // LUK table needs 'id'
    .toJS();

  return (
    <AppContentWrapper>
      <Card>
        <TableCardSegment borderless noWrap>
          <Table
              data={tableData}
              headers={tableHeaders} />
        </TableCardSegment>
      </Card>
    </AppContentWrapper>
  );
};

export default AtlasDataSetViewDataContainer;
