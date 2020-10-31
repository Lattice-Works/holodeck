/*
 * @flow
 */

import React from 'react';

import { Map, getIn } from 'immutable';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import type { EntitySet, UUID } from 'lattice';

import { Routes } from '../../core/router';

const DataSetSearchResultCard = ({
  dataSet,
  organizationId
} :{|
  dataSet :EntitySet | Map;
  organizationId :UUID;
|}) => {

  const atlasDataSetId :?UUID = getIn(dataSet, ['table', 'id']);
  const entitySetId :?UUID = dataSet.id;
  const id :UUID = dataSet.id || getIn(dataSet, ['table', 'id']);

  const goToAtlasDataSet = useGoToRoute(
    Routes.ATLAS_DATA_SET.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.ADSID_PARAM, id),
    { dataSet },
  );

  const goToEntitySet = useGoToRoute(
    Routes.ENTITY_SET.replace(Routes.ORG_ID_PARAM, organizationId).replace(Routes.ESID_PARAM, id)
  );

  const description :string = dataSet.description || getIn(dataSet, ['table', 'description']);
  const name :string = dataSet.name || getIn(dataSet, ['table', 'name']);
  const title :string = dataSet.title || getIn(dataSet, ['table', 'title']);

  const handleOnClick = () => {
    if (atlasDataSetId) {
      goToAtlasDataSet();
    }
    else if (entitySetId) {
      goToEntitySet();
    }
  };

  return (
    <Card id={id} onClick={handleOnClick}>
      <CardSegment>
        <Typography component="h2" variant="h4">{title || name}</Typography>
        <Typography>{description || name}</Typography>
      </CardSegment>
    </Card>
  );
};

export default DataSetSearchResultCard;
