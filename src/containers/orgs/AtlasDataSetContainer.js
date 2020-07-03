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
  organizationId :UUID;
};

const AtlasDataSetsContainer = ({ organizationId } :Props) => {

  const atlasDataSet :?Map = useSelector((s) => s.getIn([ORGS, 'selectedAtlasDataSet'], Map()));

  const description :string = getIn(atlasDataSet, ['table', 'description']);
  const name :string = getIn(atlasDataSet, ['table', 'name']);
  const title :string = getIn(atlasDataSet, ['table', 'title']);

  if (!atlasDataSet) {
    return (
      <Redirect to={Routes.ATLAS_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId)} />
    );
  }

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
          <Header align="start" as="h4">{title || name}</Header>
          <SubHeader align="start" as="h5">{description || name}</SubHeader>
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

export default AtlasDataSetsContainer;
