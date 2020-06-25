/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Models } from 'lattice';
import { Card, CardSegment, Colors } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';

import { Routes } from '../../core/router';

const { NEUTRALS } = Colors;
const { EntitySet } = Models;

const EntitySetTitle = styled.span`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

const EntitySetDescription = styled.span`
  color: ${NEUTRALS[1]};
  font-size: 12px;
  font-weight: normal;
  margin-top: 8px;
`;

type Props = {
  entitySet :EntitySet;
};

const EntitySetSearchResultCard = ({ entitySet } :Props) => {

  const entitySetId :UUID = (entitySet.id :any);

  const goToEntitySet = useGoToRoute(
    Routes.ENTITY_SET.replace(Routes.ESID_PARAM, entitySetId),
    { entitySet },
  );

  return (
    <Card id={entitySetId} onClick={goToEntitySet}>
      <CardSegment>
        <EntitySetTitle>{entitySet.title}</EntitySetTitle>
        <EntitySetDescription>{entitySet.description}</EntitySetDescription>
      </CardSegment>
    </Card>
  );
};

export default EntitySetSearchResultCard;
