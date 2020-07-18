/*
 * @flow
 */

import React from 'react';

import { Map } from 'immutable';
import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { Logger, ValidationUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { UUID } from 'lattice';

import EntityNeighborsContainer from './EntityNeighborsContainer';

import { EntityDataGrid, Header } from '../../components';
import { EDMUtils } from '../../core/edm';
import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { Errors } from '../../utils';

const { EntitySet, PropertyType } = Models;
const { isValidUUID } = ValidationUtils;

const { EXPLORE } = REDUCERS;
const { ERR_INVALID_UUID, ERR_UNEXPECTED_STATE } = Errors;
const { useEntityTypePropertyTypes } = EDMUtils;

type Props = {
  entityData :Object;
  entityKeyId :UUID;
  entitySet :EntitySet;
  entitySetId :UUID;
};

const LOG = new Logger('EntityDataContainer');

const EntityDataContainer = ({
  entityData,
  entityKeyId,
  entitySet,
  entitySetId,
} :Props) => {

  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(entitySet.entityTypeId);
  const neighbors :?Map = useSelector((s) => s.getIn([EXPLORE, 'entityNeighborsMap', entityKeyId]), Map());

  if (!isValidUUID(entityKeyId) || !isValidUUID(entitySetId)) {
    LOG.error(ERR_INVALID_UUID, entityKeyId, entitySetId);
    return (
      <Redirect to={Routes.EXPLORE} />
    );
  }

  if (entityData && entitySet) {
    return (
      <>
        <AppContentWrapper bgColor="white">
          <Header as="h2">{entitySet.title}</Header>
          <br />
          <EntityDataGrid data={entityData} propertyTypes={propertyTypes} />
        </AppContentWrapper>
        <AppContentWrapper bgColor="white" padding="0">
          <AppNavigationWrapper borderless>
            <NavLink to="#">Associated Data</NavLink>
          </AppNavigationWrapper>
        </AppContentWrapper>
        <AppContentWrapper>
          <EntityNeighborsContainer entityKeyId={entityKeyId} neighbors={neighbors} />
        </AppContentWrapper>
      </>
    );
  }

  LOG.error(ERR_UNEXPECTED_STATE, entitySetId, entitySet);
  return null;
};

export default EntityDataContainer;
