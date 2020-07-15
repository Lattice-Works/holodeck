/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faListAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, getIn } from 'immutable';
import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper, Breadcrumbs } from 'lattice-ui-kit';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';
import { Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';

import AtlasDataSetMetaContainer from './AtlasDataSetMetaContainer';
import AtlasDataSetViewDataContainer from './AtlasDataSetViewDataContainer';

import { BasicErrorComponent, CrumbItem, CrumbLink, Header } from '../../components';
import { Routes } from '../../core/router';
import { Errors } from '../../utils';

const { Organization } = Models;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const {
  ERR_INVALID_UUID,
  ERR_UNEXPECTED_STATE,
} = Errors;

const CrumbsWrapper = styled.div`
  margin-bottom: 16px;
`;

type Props = {
  atlasDataSet :Map;
  atlasDataSetId :UUID;
  organization :Organization;
  organizationId :UUID;
};

const LOG = new Logger('AtlasDataSetContainer');

const AtlasDataSetContainer = ({
  atlasDataSet,
  atlasDataSetId,
  organization,
  organizationId,
} :Props) => {

  if (!isValidUUID(atlasDataSetId)) {
    LOG.error(ERR_INVALID_UUID, atlasDataSetId);
    return (
      <BasicErrorComponent error="fixMe">
        Yo, this UUID is broked.
      </BasicErrorComponent>
    );
  }

  if (atlasDataSet) {

    const orgPath = Routes.ORGANIZATION.replace(Routes.ORG_ID_PARAM, organizationId);

    const aboutPath = Routes.ATLAS_DATA_SET
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.ADSID_PARAM, atlasDataSetId);

    const viewDataPath = Routes.ATLAS_DATA_SET_VIEW
      .replace(Routes.ORG_ID_PARAM, organizationId)
      .replace(Routes.ADSID_PARAM, atlasDataSetId);

    const description :string = getIn(atlasDataSet, ['table', 'description']);
    const name :string = getIn(atlasDataSet, ['table', 'name']);
    const title :string = getIn(atlasDataSet, ['table', 'title']);

    const renderAtlasDataSetMetaContainer = () => (
      <AtlasDataSetMetaContainer atlasDataSet={atlasDataSet} />
    );

    const renderAtlasDataSetViewDataContainer = () => (
      <AtlasDataSetViewDataContainer
          atlasDataSet={atlasDataSet}
          atlasDataSetId={atlasDataSetId}
          organizationId={organizationId} />
    );

    return (
      <>
        <AppContentWrapper bgColor="white" borderless>
          <CrumbsWrapper>
            <Breadcrumbs>
              <CrumbLink to={orgPath}>{organization.title}</CrumbLink>
              <CrumbItem>{title || name}</CrumbItem>
            </Breadcrumbs>
          </CrumbsWrapper>
          <div>
            <Header as="h2">
              <FontAwesomeIcon fixedWidth icon={faListAlt} size="sm" style={{ marginRight: '20px' }} />
              <span>{title || name}</span>
            </Header>
          </div>
          {
            isNonEmptyString(description) && (
              <div>{description}</div>
            )
          }
        </AppContentWrapper>
        <AppContentWrapper bgColor="white" padding="0">
          <AppNavigationWrapper borderless>
            <NavLink exact strict to={aboutPath}>About</NavLink>
            <NavLink to={viewDataPath}>View Data</NavLink>
          </AppNavigationWrapper>
        </AppContentWrapper>
        <Switch>
          <Route exact path={Routes.ATLAS_DATA_SET} render={renderAtlasDataSetMetaContainer} />
          <Route exact path={Routes.ATLAS_DATA_SET_VIEW} render={renderAtlasDataSetViewDataContainer} />
        </Switch>
      </>
    );
  }

  LOG.error(ERR_UNEXPECTED_STATE, organizationId, atlasDataSetId, atlasDataSet);
  return null;
};

export default AtlasDataSetContainer;
