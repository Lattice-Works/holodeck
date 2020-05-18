/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Models } from 'lattice';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  Table,
} from 'lattice-ui-kit';

import { EDMUtils } from '../../../core/edm';

const { EntitySet, PropertyType } = Models;
const { useEntityTypePropertyTypes } = EDMUtils;

const ScrollableCard = styled(Card)`
  overflow: scroll;
`;

const FixedWidthCardSegment = styled(CardSegment)`
  min-width: 900px;
`;

const TABLE_HEADERS = [
  { key: 'title', label: 'TITLE' },
  { key: 'description', label: 'DESCRIPTION' },
  { key: 'datatype', label: 'DATA TYPE' },
];

type Props = {
  entitySet :EntitySet;
};

const EntitySetMetaContainer = ({ entitySet } :Props) => {

  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(entitySet.entityTypeId);

  return (
    <AppContentWrapper>
      <ScrollableCard>
        <FixedWidthCardSegment vertical>
          <Table
              data={propertyTypes}
              headers={TABLE_HEADERS} />
        </FixedWidthCardSegment>
      </ScrollableCard>
    </AppContentWrapper>
  );
};

export default EntitySetMetaContainer;
