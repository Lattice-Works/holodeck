/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  Card,
  Spinner,
  Table,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { BasicErrorComponent, TableCardSegment } from '../../components';
import { DataActions } from '../../core/data';
import { ReduxActions } from '../../core/redux';
import { REDUCERS } from '../../core/redux/constants';

const { FETCH_ATLAS_DATA_SET_DATA, fetchAtlasDataSetData } = DataActions;

const { DATA } = REDUCERS;
const { resetRequestState } = ReduxActions;

type Props = {
  atlasDataSet :Map;
  atlasDataSetId :UUID;
  organizationId :UUID;
};

const AtlasDataSetViewDataContainer = ({ atlasDataSet, atlasDataSetId, organizationId } :Props) => {

  const dispatch = useDispatch();

  const fetchAtlasDataSetDataRS :?RequestState = useRequestState([DATA, FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId]);
  const data :Map = useSelector((s :Map) => s.getIn([DATA, 'atlasDataSetData', atlasDataSetId], Map()));

  useEffect(() => {
    dispatch(fetchAtlasDataSetData({ atlasDataSetId, organizationId }));
  }, [dispatch, organizationId, atlasDataSetId]);

  useEffect(() => () => (
    dispatch(resetRequestState([FETCH_ATLAS_DATA_SET_DATA]))
  ), []);

  // OPTIMIZE: no need to compute this on every render
  const tableData = data
    .map((row) => row.set('id', row.hashCode())) // LUK table needs 'id'
    .toJS(); // TODO: avoid .toJS()

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = atlasDataSet
    .get('columns', List())
    .map((column) => ({
      key: column.get('id'),
      label: `${column.get('title') || column.get('name')}${column.get('primaryKey') ? ' (PK)' : ''}`,
      sortable: false,
    }))
    .toJS(); // TODO: avoid .toJS()

  return (
    <AppContentWrapper>
      {
        fetchAtlasDataSetDataRS === RequestStates.PENDING && (
          <Spinner size="2x" />
        )
      }
      {
        fetchAtlasDataSetDataRS === RequestStates.FAILURE && (
          <BasicErrorComponent />
        )
      }
      {
        fetchAtlasDataSetDataRS === RequestStates.SUCCESS && (
          <Card>
            <TableCardSegment borderless noWrap>
              <Table
                  data={tableData}
                  headers={tableHeaders} />
            </TableCardSegment>
          </Card>
        )
      }
    </AppContentWrapper>
  );
};

export default AtlasDataSetViewDataContainer;
