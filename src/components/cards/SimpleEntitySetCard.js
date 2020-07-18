/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import { Card, CardSegment } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';
import type { UUID } from 'lattice';

import { Routes } from '../../core/router';
import { Header, SubHeader } from '../headers';

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
        <Header align="start" as="h4">{entitySet.title || entitySet.name}</Header>
        <SubHeader align="start" as="h5">{entitySet.description || entitySet.name}</SubHeader>
      </CardSegment>
    </Card>
  );
};

export default SimpleEntitySetCard;
