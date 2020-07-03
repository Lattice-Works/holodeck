/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import { RoutingUtils } from 'lattice-utils';
import { useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
} from 'react-router';

import OrgContainer from './OrgContainer';

import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { Organization } = Models;
const { getParamFromMatch } = RoutingUtils;

const { ORGS } = REDUCERS;

const OrgsRouter = () => {

  let organizationId :?UUID;
  const matchOrganization = useRouteMatch(Routes.ORGANIZATION);
  if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const organization :?Organization = useSelector((s) => s.getIn([ORGS, 'organizationsMap', organizationId]));

  // let dataSetId :?UUID;
  // const matchAtlasDataSet = useRouteMatch(Routes.ATLAS_DATA_SET);
  // if (matchAtlasDataSet) {
  //   dataSetId = getParamFromMatch(matchAtlasDataSet, Routes.DSID_PARAM);
  // }

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
