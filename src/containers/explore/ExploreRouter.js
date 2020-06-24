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

import ExploreContainer from './ExploreContainer';
import {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_SET,
  exploreEntityData,
  exploreEntityNeighbors,
  exploreEntitySet,
} from './ExploreActions';

import { BasicErrorComponent } from '../../components';
import { ReduxActions } from '../../core/redux';
import { ERROR, REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { SearchActions } from '../../core/search';
import { EntityDataContainer } from '../entitydata';
import { EntitySetContainer } from '../entityset';

const { EntitySet } = Models;
const { getParamFromMatch } = RoutingUtils;
const { isValidUUID } = ValidationUtils;

const { EXPLORE } = REDUCERS;
const { resetRequestState } = ReduxActions;
const { SEARCH_ENTITY_SET, clearSearchState } = SearchActions;

const ExploreRouter = () => {

  const dispatch = useDispatch();

  const matchEntityData = useRouteMatch(Routes.ENTITY_DATA);
  const matchEntitySet = useRouteMatch(Routes.ENTITY_SET);

  let entityKeyId :?UUID;
  let entitySetId :?UUID;
  if (matchEntityData) {
    entityKeyId = getParamFromMatch(matchEntityData, Routes.EKID_PARAM);
    entitySetId = getParamFromMatch(matchEntityData, Routes.ESID_PARAM);
  }
  else if (matchEntitySet) {
    entitySetId = getParamFromMatch(matchEntitySet, Routes.ESID_PARAM);
  }

  const exploreEntityDataRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_DATA]);
  const exploreEntitySetRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_SET]);
  const exploreEntityDataError :?SagaError = useSelector((s) => s.getIn([EXPLORE, EXPLORE_ENTITY_DATA, ERROR]));
  const exploreEntitySetError :?SagaError = useSelector((s) => s.getIn([EXPLORE, EXPLORE_ENTITY_SET, ERROR]));
  const entityData :?Object = useSelector((s) => s.getIn([EXPLORE, 'selectedEntityData']));
  const entitySet :?EntitySet = useSelector((s) => s.getIn([EXPLORE, 'selectedEntitySet']));

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
    if (!matchEntityData && !matchEntitySet) {
      dispatch(resetRequestState([EXPLORE_ENTITY_DATA]));
      dispatch(resetRequestState([EXPLORE_ENTITY_SET]));
    }
  }, [dispatch, matchEntityData, matchEntitySet]);

  if (exploreEntityDataRS === RequestStates.PENDING || exploreEntitySetRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  if (exploreEntityDataRS === RequestStates.FAILURE || exploreEntitySetRS === RequestStates.FAILURE) {
    return (
      <AppContentWrapper>
        <BasicErrorComponent error={exploreEntityDataError || exploreEntitySetError} />
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
      : null
  );

  const renderEntitySetContainer = () => (
    entitySet && entitySetId
      ? <EntitySetContainer entitySet={entitySet} entitySetId={entitySetId} />
      : null
  );

  return (
    <Switch>
      <Route exact path={Routes.EXPLORE} component={ExploreContainer} />
      <Route path={Routes.ENTITY_SET} render={renderEntitySetContainer} />
      <Route path={Routes.ENTITY_DATA} render={renderEntityDataContainer} />
      <Redirect to={Routes.EXPLORE} />
    </Switch>
  );
};

export default ExploreRouter;
