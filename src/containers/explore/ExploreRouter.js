/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Map } from 'immutable';
import { Models } from 'lattice';
import { AppContentWrapper, Spinner } from 'lattice-ui-kit';
import {
  ReduxUtils,
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

import ExploreContainer from './ExploreContainer';
import {
  EXPLORE_ATLAS_DATA_SET,
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_SET,
  EXPLORE_ORGANIZATION,
  exploreAtlasDataSet,
  exploreEntityData,
  exploreEntityNeighbors,
  exploreEntitySet,
  exploreOrganization,
} from './ExploreActions';

import { BasicErrorComponent } from '../../components';
import { ReduxActions } from '../../core/redux';
import { ERROR, REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { SearchActions } from '../../core/search';
import { EntityDataContainer } from '../entitydata';
import { EntitySetContainer } from '../entityset';
import { AtlasDataSetContainer, OrgContainer } from '../orgs';

const { EntitySet, Organization } = Models;
const { reduceRequestStates } = ReduxUtils;
const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const { EXPLORE } = REDUCERS;
const { resetRequestState } = ReduxActions;
const { SEARCH_ENTITY_SET, clearSearchState } = SearchActions;

const ExploreRouter = () => {

  const dispatch = useDispatch();

  const matchAtlasDataSet = useRouteMatch(Routes.ATLAS_DATA_SET);
  const matchEntityData = useRouteMatch(Routes.ENTITY_DATA);
  const matchEntitySet = useRouteMatch(Routes.ENTITY_SET);
  const matchOrganization = useRouteMatch(Routes.ORG);

  let atlasDataSetId :?UUID;
  let entityKeyId :?UUID;
  let entitySetId :?UUID;
  let organizationId :?UUID;

  // check matchEntityData first because it's more specific than matchEntitySet
  if (matchEntityData) {
    entityKeyId = getParamFromMatch(matchEntityData, Routes.EKID_PARAM);
    entitySetId = getParamFromMatch(matchEntityData, Routes.ESID_PARAM);
  }
  else if (matchEntitySet) {
    entitySetId = getParamFromMatch(matchEntitySet, Routes.ESID_PARAM);
  }
  // check matchAtlasDataSet first because it's more specific than matchOrganization
  else if (matchAtlasDataSet) {
    atlasDataSetId = getParamFromMatch(matchAtlasDataSet, Routes.ADSID_PARAM);
    organizationId = getParamFromMatch(matchAtlasDataSet, Routes.ORG_ID_PARAM);
  }
  else if (matchOrganization) {
    organizationId = getParamFromMatch(matchOrganization, Routes.ORG_ID_PARAM);
  }

  const exploreAtlasDataSetRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ATLAS_DATA_SET]);
  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA]);
  const exploreEntitySetRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_SET]);
  const exploreOrganizationRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ORGANIZATION]);

  const exploreAtlasDataSetError :?SagaError = useSelector((s) => s.getIn([EXPLORE, EXPLORE_ATLAS_DATA_SET, ERROR]));
  const exploreEntityDataError :?SagaError = useSelector((s) => s.getIn([EXPLORE, EXPLORE_ENTITY_DATA, ERROR]));
  const exploreEntitySetError :?SagaError = useSelector((s) => s.getIn([EXPLORE, EXPLORE_ENTITY_SET, ERROR]));
  const exploreOrganizationError :?SagaError = useSelector((s) => s.getIn([EXPLORE, EXPLORE_ORGANIZATION, ERROR]));

  const atlasDataSet :?Map = useSelector((s) => s.getIn([EXPLORE, 'selectedAtlasDataSet']));
  const entityData :?Object = useSelector((s) => s.getIn([EXPLORE, 'selectedEntityData']));
  const entitySet :?EntitySet = useSelector((s) => s.getIn([EXPLORE, 'selectedEntitySet']));
  const organization :?Organization = useSelector((s) => s.getIn([EXPLORE, 'selectedOrganization']));

  useEffect(() => {
    if (isValidUUID(entitySetId)) {
      dispatch(clearSearchState(SEARCH_ENTITY_SET));
      dispatch(exploreEntitySet(entitySetId));
    }
  }, [dispatch, entitySetId]);

  useEffect(() => {
    if (isValidUUID(entityKeyId) && isValidUUID(entitySetId)) {
      dispatch(exploreEntityData({ entityKeyId, entitySetId }));
      dispatch(exploreEntityNeighbors({ entityKeyId, entitySetId }));
    }
  }, [dispatch, entityKeyId, entitySetId]);

  useEffect(() => {
    dispatch(resetRequestState([EXPLORE_ORGANIZATION]));
    if (isValidUUID(organizationId)) {
      dispatch(exploreOrganization(organizationId));
    }
  }, [dispatch, organizationId]);

  useEffect(() => {
    if (isValidUUID(organizationId) && isValidUUID(atlasDataSetId)) {
      dispatch(exploreAtlasDataSet({ atlasDataSetId, organizationId }));
    }
  }, [atlasDataSetId, dispatch, organizationId]);

  useEffect(() => {
    if (!matchEntityData && !matchEntitySet) {
      dispatch(resetRequestState([EXPLORE_ENTITY_DATA]));
      dispatch(resetRequestState([EXPLORE_ENTITY_SET]));
    }
  }, [dispatch, matchEntityData, matchEntitySet]);

  const reducedRS :?RequestState = reduceRequestStates([
    exploreAtlasDataSetRS,
    exploreEntityDataRS,
    exploreEntitySetRS,
    exploreOrganizationRS,
  ]);
  if (reducedRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  if (reducedRS === RequestStates.FAILURE) {
    const error = (
      exploreAtlasDataSetError
      || exploreEntityDataError
      || exploreEntitySetError
      || exploreOrganizationError
    );
    return (
      <AppContentWrapper>
        <BasicErrorComponent error={error} />
      </AppContentWrapper>
    );
  }

  const renderEntityDataContainer = () => (
    (entityData && entityKeyId && entitySet && entitySetId)
      ? (
        <EntityDataContainer
            entityData={entityData}
            entityKeyId={entityKeyId}
            entitySet={entitySet}
            entitySetId={entitySetId} />
      )
      // TODO: better error component
      : <BasicErrorComponent />
  );

  const renderEntitySetContainer = () => (
    entitySet && entitySetId
      ? <EntitySetContainer entitySet={entitySet} entitySetId={entitySetId} />
      // TODO: better error component
      : <BasicErrorComponent />
  );

  const renderOrgContainer = () => (
    organization && organizationId
      ? <OrgContainer organization={organization} organizationId={organizationId} />
      // TODO: better error component
      : <BasicErrorComponent />
  );

  const renderAtlasDataSetContainer = () => (
    atlasDataSet && atlasDataSetId && organization && organizationId
      ? (
        <AtlasDataSetContainer
            atlasDataSet={atlasDataSet}
            atlasDataSetId={atlasDataSetId}
            organization={organization}
            organizationId={organizationId} />
      )
      // TODO: better error component
      : <BasicErrorComponent />
  );

  return (
    <Switch>
      <Route exact path={Routes.EXPLORE} component={ExploreContainer} />
      <Route path={Routes.ENTITY_SET} render={renderEntitySetContainer} />
      <Route path={Routes.ENTITY_DATA} render={renderEntityDataContainer} />
      <Route path={Routes.ATLAS_DATA_SET} render={renderAtlasDataSetContainer} />
      <Route path={Routes.ORG} render={renderOrgContainer} />
      <Redirect to={Routes.EXPLORE} />
    </Switch>
  );
};

export default ExploreRouter;
