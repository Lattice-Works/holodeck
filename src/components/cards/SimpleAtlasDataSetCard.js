/*
 * @flow
 */

import React from 'react';

import { Map, getIn } from 'immutable';
import { Card, CardSegment } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';

import { Routes } from '../../core/router';
import { Header, SubHeader } from '../headers';

type Props = {
  dataSet :Map;
  organizationId :UUID;
};

const SimpleAtlasDataSetCard = ({ dataSet, organizationId } :Props) => {

  const dataSetId :UUID = getIn(dataSet, ['table', 'id']);

  const goToAtlasDataSet = useGoToRoute(
    Routes.ATLAS_DATA_SET.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.DSID_PARAM, dataSetId),
    { dataSet },
  );

  const description :string = getIn(dataSet, ['table', 'description']);
  const name :string = getIn(dataSet, ['table', 'name']);
  const title :string = getIn(dataSet, ['table', 'title']);

  return (
    <Card id={dataSetId} onClick={goToAtlasDataSet}>
      <CardSegment>
        <Header align="start" as="h4">{title || name}</Header>
        <SubHeader align="start" as="h5">{description || name}</SubHeader>
      </CardSegment>
    </Card>
  );
};

export default SimpleAtlasDataSetCard;
