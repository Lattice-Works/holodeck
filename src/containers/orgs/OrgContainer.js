/*
 * @flow
 */

import React from 'react';

import { faLandmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';

import AtlasDataSetContainer from './AtlasDataSetContainer';
import AtlasDataSetsContainer from './AtlasDataSetsContainer';

import { Header } from '../../components';
import { Routes } from '../../core/router';
import { Errors } from '../../utils';

const { Organization } = Models;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const { ERR_INVALID_UUID, ERR_UNEXPECTED_STATE } = Errors;

type Props = {
  organization :Organization;
  organizationId :UUID;
};

const LOG = new Logger('OrgContainer');

const OrgContainer = ({ organization, organizationId } :Props) => {

  if (!isValidUUID(organizationId)) {
    LOG.error(ERR_INVALID_UUID, organizationId);
    return (
      <Redirect to={Routes.EXPLORE} />
    );
  }

  if (organization) {

    const atlasDataSetsPath = Routes.ATLAS_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId);

    const renderAtlasDataSetContainer = () => (
      <AtlasDataSetContainer organizationId={organizationId} />
    );

    const renderAtlasDataSetsContainer = () => (
      <AtlasDataSetsContainer organizationId={organizationId} />
    );

    return (
      <>
        <AppContentWrapper bgColor="white" borderless>
          <div>
            <Header as="h2">
              <FontAwesomeIcon fixedWidth icon={faLandmark} size="sm" style={{ marginRight: '20px' }} />
              <span>{organization.title}</span>
            </Header>
            {/* <OrgSelect onChange={handleOnChangeOrgSelect} /> */}
          </div>
          {
            isNonEmptyString(organization.description) && (
              <div>{organization.description}</div>
            )
          }
        </AppContentWrapper>
        <AppContentWrapper bgColor="white" padding="0">
          <AppNavigationWrapper borderless>
            <NavLink exact to={atlasDataSetsPath}>Atlas Data Sets</NavLink>
          </AppNavigationWrapper>
        </AppContentWrapper>
        <Switch>
          <Route exact path={Routes.ATLAS_DATA_SETS} render={renderAtlasDataSetsContainer} />
          <Route exact path={Routes.ATLAS_DATA_SET} render={renderAtlasDataSetContainer} />
        </Switch>
      </>
    );
  }

  LOG.error(ERR_UNEXPECTED_STATE, organizationId, organization);
  return null;
};

export default OrgContainer;
