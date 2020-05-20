/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Models } from 'lattice';
import { DataApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  Breadcrumbs,
  Card,
  CardSegment,
  Table,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { CrumbItem, CrumbLink, TableCardSegment } from '../../../components';
import { EDMUtils } from '../../../core/edm';
import { REDUCERS } from '../../../core/redux/constants';
import { Routes } from '../../../core/router';

const { EntitySet, PropertyType } = Models;
const { getEntityData } = DataApiActions;

const { ENTITY_SET } = REDUCERS;
const { useEntityTypePropertyTypes } = EDMUtils;

const TABLE_HEADERS = [
  { key: 'property', label: 'PROPERTY' },
  { key: 'value', label: 'DATA' },
];

type Props = {
  entitySet :EntitySet;
};

const EntityDataContainer = ({ entitySet } :Props) => {

  const dispatch = useDispatch();
  const { entityKeyId } = useParams();

  const entityData :?Object = useSelector((s) => s.getIn([ENTITY_SET, 'entityData']));
  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(entitySet.entityTypeId);

  useEffect(() => {
    if (!entityData) {
      dispatch(getEntityData({ entityKeyId, entitySetId: entitySet.id }));
    }
  }, [dispatch, entityData, entityKeyId, entitySet]);

  if (entityData) {

    const searchPath = Routes.ENTITY_SET_SEARCH.replace(Routes.ESID_PARAM, (entitySet.id :any));
    const data = propertyTypes.map((propertyType) => ({
      value: entityData[propertyType.type],
      property: propertyType.title,
    }));

    return (
      <>
        <AppContentWrapper padding="30px 30px 0 30px">
          <Breadcrumbs>
            <CrumbLink to={searchPath}>SEARCH</CrumbLink>
            <CrumbItem>{entityKeyId}</CrumbItem>
          </Breadcrumbs>
        </AppContentWrapper>
        <AppContentWrapper>
          <Card>
            <TableCardSegment>
              <Table
                  data={data}
                  headers={TABLE_HEADERS} />
            </TableCardSegment>
          </Card>
        </AppContentWrapper>
      </>
    );
  }

  return null;
};

export default EntityDataContainer;
