/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import AssociationGroup from './AssociationGroup';

const AssociationGroupContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type Props = {
  entityTypes :List;
  entityTypesIndexMap :Map;
  neighbors :Map<string, Map<string, Map<*, *>>>;
  onSelectEntity :({ entitySetId :string, entity :Map<*, *> }) => void;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
};

const NeighborTables = ({
  entityTypes,
  entityTypesIndexMap,
  neighbors,
  onSelectEntity,
  propertyTypes,
  propertyTypesIndexMap,
} :Props) => neighbors.entrySeq().map(([assocId, neighborsById]) => (
  <AssociationGroupContainer key={assocId}>
    <AssociationGroup
        entityTypes={entityTypes}
        entityTypesIndexMap={entityTypesIndexMap}
        neighborsById={neighborsById}
        onSelectEntity={onSelectEntity}
        propertyTypes={propertyTypes}
        propertyTypesIndexMap={propertyTypesIndexMap} />
  </AssociationGroupContainer>
));

export default NeighborTables;
