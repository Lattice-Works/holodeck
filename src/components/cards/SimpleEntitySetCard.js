/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import { Card, CardSegment, Typography } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import type { UUID } from 'lattice';

import { Routes } from '../../core/router';

const { EntitySet } = Models;

type Props = {
  entitySet :EntitySet;
};

const SimpleEntitySetCard = ({ entitySet } :Props) => {

  const entitySetId :UUID = (entitySet.id :any);
  const goToEntitySet = useGoToRoute(
    Routes.ENTITY_SET.replace(Routes.ESID_PARAM, entitySetId),
    { entitySet },
  );

  return (
    <Card id={entitySetId} onClick={goToEntitySet}>
      <CardSegment>
        <Typography gutterBottom variant="h3">{entitySet.title || entitySet.name}</Typography>
        <Typography>{entitySet.description || entitySet.name}</Typography>
      </CardSegment>
    </Card>
  );
};

export default SimpleEntitySetCard;
