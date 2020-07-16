/*
 * @flow
 */

import React from 'react';

import { faLandmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';

import AtlasDataSetsContainer from './AtlasDataSetsContainer';

import { Header } from '../../components';
import { Routes } from '../../core/router';

const { Organization } = Models;
const { isNonEmptyString } = LangUtils;

type Props = {
  organization :Organization;
  organizationId :UUID;
};

const OrgContainer = ({ organization, organizationId } :Props) => {

  const atlasDataSetsPath = Routes.ATLAS_DATA_SETS.replace(Routes.ORG_ID_PARAM, organizationId);

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
      </Switch>
    </>
  );
};

export default OrgContainer;
