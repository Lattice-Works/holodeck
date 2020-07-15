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
  atlasDataSet :Map;
  organizationId :UUID;
};

const SimpleAtlasDataSetCard = ({ atlasDataSet, organizationId } :Props) => {

  const atlasDataSetId :UUID = getIn(atlasDataSet, ['table', 'id']);

  const goToAtlasDataSet = useGoToRoute(
    Routes.ATLAS_DATA_SET.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.ADSID_PARAM, atlasDataSetId),
    { atlasDataSet },
  );

  const description :string = getIn(atlasDataSet, ['table', 'description']);
  const name :string = getIn(atlasDataSet, ['table', 'name']);
  const title :string = getIn(atlasDataSet, ['table', 'title']);

  return (
    <Card id={atlasDataSetId} onClick={goToAtlasDataSet}>
      <CardSegment>
        <Header align="start" as="h4">{title || name}</Header>
        <SubHeader align="start" as="h5">{description || name}</SubHeader>
      </CardSegment>
    </Card>
  );
};

export default SimpleAtlasDataSetCard;
