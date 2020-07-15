/*
 * @flow
 */

import React from 'react';

import { List, Map, getIn } from 'immutable';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  Table,
} from 'lattice-ui-kit';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';

import { Header, SubHeader } from '../../components';
import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { ORGS } = REDUCERS;

const TABLE_HEADERS = [
  {
    key: 'columnName',
    label: 'COLUMN NAME',
  },
  {
    key: 'description',
    label: 'DESCRIPTION',
  },
  {
    key: 'datatype',
    label: 'DATA TYPE',
  },
];

const ROWS_PER_PAGE = [25, 50, 75, 100];

type Props = {
  atlasDataSet :Map;
  // atlasDataSetId :UUID;
  // organizationId :UUID;
};

const AtlasDataSetMetaContainer = ({ atlasDataSet } :Props) => {

  // OPTIMIZE: no need to compute this on every render
  const data = atlasDataSet.get('columns', List()).map((column) => ({
    columnName: column.get('name'),
    datatype: column.get('datatype'),
    description: column.get('description'),
    id: column.get('id'),
  }));

  return (
    <AppContentWrapper>
      <Card>
        <CardSegment>
          <Table
              data={data}
              headers={TABLE_HEADERS}
              paginated
              rowsPerPageOptions={ROWS_PER_PAGE}
              totalRows={data.count()} />
        </CardSegment>
      </Card>
    </AppContentWrapper>
  );
};

export default AtlasDataSetMetaContainer;
