/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map, getIn } from 'immutable';
import { Models } from 'lattice';
import { DataSetsApiActions } from 'lattice-sagas';
import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import { RoutingUtils, ValidationUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
} from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import AtlasDataSetContainer from './AtlasDataSetContainer';
import OrgContainer from './OrgContainer';

import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';

const { Organization } = Models;
const { isValidUUID } = ValidationUtils;
const { getParamFromMatch } = RoutingUtils;
const { GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, getOrganizationDataSetsWithColumns } = DataSetsApiActions;

const { ORGS } = REDUCERS;

const OrgsRouter = () => {

  const dispatch = useDispatch();

  const matchAtlasDataSet = useRouteMatch(Routes.ATLAS_DATA_SET);
  const matchOrganization = useRouteMatch(Routes.ORGANIZATION);

  let atlasDataSetId :?UUID;
  let organizationId :?UUID;
  if (matchAtlasDataSet) {
    atlasDataSetId = getParamFromMatch(matchAtlasDataSet, Routes.ADSID_PARAM);
    organizationId = getParamFromMatch(matchAtlasDataSet, Routes.ORG_ID_PARAM);
  }
  else if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const getAtlasDataSetsRS :?RequestState = useRequestState([ORGS, GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS]);
  const organization :?Organization = useSelector((s) => s.getIn([ORGS, 'organizationsMap', organizationId]));

  // TODO: exploreAtlasDataSet()
  const atlasDataSet :?Map = useSelector((s) => {
    let selectedAtlasDataSet = s.getIn([ORGS, 'selectedAtlasDataSet']);
    if (!selectedAtlasDataSet && isValidUUID(atlasDataSetId) && isValidUUID(organizationId)) {
      selectedAtlasDataSet = s.getIn([ORGS, 'atlasDataSets', organizationId], List())
        .find((ads :Map) => getIn(ads, ['table', 'id']) === atlasDataSetId);
    }
    return selectedAtlasDataSet;
  });

  useEffect(() => {
    if (isValidUUID(organizationId)) {
      dispatch(getOrganizationDataSetsWithColumns(organizationId));
    }
  }, [dispatch, organizationId]);

  if (getAtlasDataSetsRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  const renderOrgContainer = () => (
    organization && organizationId
      ? <OrgContainer organization={organization} organizationId={organizationId} />
      : null
  );

  const renderAtlasDataSetContainer = () => (
    atlasDataSet && atlasDataSetId && organizationId
      ? (
        <AtlasDataSetContainer
            atlasDataSet={atlasDataSet}
            atlasDataSetId={atlasDataSetId}
            organization={organization}
            organizationId={organizationId} />
      )
      : null
  );

  return (
    <Switch>
      <Route exact path={Routes.ORGANIZATIONS} component={() => null} />
      <Route path={Routes.ATLAS_DATA_SET} render={renderAtlasDataSetContainer} />
      <Route path={Routes.ORGANIZATION} render={renderOrgContainer} />
      <Redirect to={Routes.ORGANIZATIONS} />
    </Switch>
  );
};

export default OrgsRouter;
