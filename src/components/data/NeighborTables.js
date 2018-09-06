/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

import AssociationGroup from './AssociationGroup';

const AssociationGroupContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type Props = {
  neighbors :Map<string, Map<string, Map<*, *>>>,
  propertyTypesById :Map<string, *>,
  entityTypesById :Map<string, *>
};

const NeighborTables = ({ entityTypesById, neighbors, propertyTypesById } :Props) =>
  neighbors.entrySeq().map(([assocId, neighborsById]) => (
    <AssociationGroupContainer key={assocId}>
      <AssociationGroup
          neighborsById={neighborsById}
          entityTypesById={entityTypesById}
          propertyTypesById={propertyTypesById} />
    </AssociationGroupContainer>
  ));

export default NeighborTables;
