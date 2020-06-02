/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import {
  AppContentWrapper,
  Card,
  Table,
} from 'lattice-ui-kit';

import { TableCardSegment } from '../../components';
import { EDMUtils } from '../../core/edm';

const { EntitySet, PropertyType } = Models;
const { useEntityTypePropertyTypes } = EDMUtils;

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
      <Card>
        <TableCardSegment>
          <Table
              data={propertyTypes}
              headers={TABLE_HEADERS} />
        </TableCardSegment>
      </Card>
    </AppContentWrapper>
  );
};

export default EntitySetMetaContainer;
