/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Models } from 'lattice';
import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import {
  RoutingUtils,
  ValidationUtils,
  useRequestState,
} from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
} from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import OrgContainer from './OrgContainer';

import { ERROR, REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { Organization } = Models;
const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const { ORGS } = REDUCERS;

const OrgsRouter = () => {

  const dispatch = useDispatch();

  let organizationId :?UUID;
  const matchOrganization = useRouteMatch(Routes.ORGANIZATION);
  if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const organization :?Organization = useSelector((s) => s.getIn([ORGS, 'organizationsMap', organizationId]));

  let dataSetId :?UUID;
  const matchAtlasDataSet = useRouteMatch(Routes.ATLAS_DATA_SET);
  if (matchAtlasDataSet) {
    dataSetId = getParamFromMatch(matchAtlasDataSet, Routes.DSID_PARAM);
  }

  const renderOrgContainer = () => (
    organization && organizationId
      ? <OrgContainer organization={organization} organizationId={organizationId} />
      : null
  );

  return (
    <Switch>
      <Route exact path={Routes.ORGANIZATIONS} component={() => null} />
      <Route path={Routes.ORGANIZATION} render={renderOrgContainer} />
      <Redirect to={Routes.ORGANIZATIONS} />
    </Switch>
  );
};

export default OrgsRouter;
