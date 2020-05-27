/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import {
  AppContentWrapper,
  AppNavigationWrapper,
  Breadcrumbs,
  Colors,
} from 'lattice-ui-kit';
import { Logger, ValidationUtils } from 'lattice-utils';
import { Redirect } from 'react-router';
import { NavLink } from 'react-router-dom';

import {
  CrumbItem,
  CrumbLink,
  EntityDataGrid,
} from '../../components';
import { EDMUtils } from '../../core/edm';
import { Routes } from '../../core/router';
import { Errors } from '../../utils';

const { WHITE } = Colors;
const { EntitySet, PropertyType } = Models;
const { isValidUUID } = ValidationUtils;

const {
  ERR_INVALID_UUID,
  ERR_UNEXPECTED_STATE,
} = Errors;
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

  if (!isValidUUID(entityKeyId) || !isValidUUID(entitySetId)) {
    LOG.error(ERR_INVALID_UUID, entityKeyId, entitySetId);
    return (
      <Redirect to={Routes.EXPLORE} />
    );
  }

  if (entityData && entitySet) {

    // TODO: move out to ExploreRouter
    const searchPath = Routes.ENTITY_SET_SEARCH.replace(Routes.ESID_PARAM, entitySetId);

    return (
      <>
        <AppContentWrapper bgColor={WHITE}>
          <Breadcrumbs>
            <CrumbLink to={searchPath}>SEARCH</CrumbLink>
            <CrumbItem>{entityKeyId}</CrumbItem>
          </Breadcrumbs>
        </AppContentWrapper>
        <AppContentWrapper bgColor={WHITE}>
          <EntityDataGrid data={entityData} propertyTypes={propertyTypes} />
        </AppContentWrapper>
        <AppContentWrapper bgColor={WHITE} padding="0">
          <AppNavigationWrapper borderless>
            <NavLink to="#">Associations</NavLink>
          </AppNavigationWrapper>
        </AppContentWrapper>
        {/* <AppContentWrapper></AppContentWrapper> */}
      </>
    );
  }

  LOG.error(ERR_UNEXPECTED_STATE, entitySetId, entitySet);
  return null;
};

export default EntityDataContainer;
