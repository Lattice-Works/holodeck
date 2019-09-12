/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import AssociationGroup from './AssociationGroup';

const AssociationGroupContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type Props = {
  entityTypesById :Map<string, *>;
  neighbors :Map<string, Map<string, Map<*, *>>>;
  onSelectEntity :({ entitySetId :string, entity :Map<*, *> }) => void;
  propertyTypesById :Map<string, *>;
};

const NeighborTables = ({
  entityTypesById,
  neighbors,
  propertyTypesById,
  onSelectEntity
} :Props) => neighbors.entrySeq().map(([assocId, neighborsById]) => (
  <AssociationGroupContainer key={assocId}>
    <AssociationGroup
        neighborsById={neighborsById}
        entityTypesById={entityTypesById}
        propertyTypesById={propertyTypesById}
        onSelectEntity={onSelectEntity} />
  </AssociationGroupContainer>
));

export default NeighborTables;
