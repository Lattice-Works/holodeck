/*
 * @flow
 */

import React, { useEffect } from 'react';

import { Models } from 'lattice';
import { EntitySetsApiActions } from 'lattice-sagas';
import {
  AppContentWrapper,
  AppNavigationWrapper,
  Colors,
  Spinner,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  useParams,
} from 'react-router';
import { NavLink } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import {
  EntitySetMetaContainer,
  EntitySetOverviewContainer,
  EntitySetSearchContainer,
} from './components';

import { useRequestState } from '../../components/hooks';
import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { Logger, ValidationUtils } from '../../utils';

const LOG :Logger = new Logger('EntitySetRouter');

const { WHITE } = Colors;
const { ENTITY_SET } = REDUCERS;
const { EntitySet } = Models;
const { GET_ENTITY_SET } = EntitySetsApiActions;

type EntitySetParams = {
  entitySetId :?UUID;
};

const EntitySetRouter = () => {

  const dispatch = useDispatch();
  const { entitySetId } :EntitySetParams = useParams();

  const entitySet :?EntitySet = useSelector((s) => s.getIn([ENTITY_SET, 'entitySet']));
  const getEntitySetRS :?RequestState = useRequestState(ENTITY_SET, GET_ENTITY_SET);

  useEffect(() => {
    if (!entitySet) {
      dispatch(EntitySetsApiActions.getEntitySet(entitySetId));
    }
  }, [dispatch, entitySet, entitySetId]);

  if (!entitySetId || !ValidationUtils.isValidUUID(entitySetId)) {
    LOG.error('invalid entity set id', entitySetId);
    return (
      <Redirect to={Routes.ROOT} />
    );
  }

  if (getEntitySetRS === RequestStates.PENDING) {
    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  if (getEntitySetRS === RequestStates.FAILURE) {
    return (
      <Redirect to={Routes.ROOT} />
    );
  }

  if (entitySet) {

    const aboutPath = Routes.ENTITY_SET.replace(Routes.ESID_PARAM, entitySetId);
    const searchPath = Routes.ENTITY_SET_SEARCH.replace(Routes.ESID_PARAM, entitySetId);

    const renderEntitySetMetaContainer = () => (
      <EntitySetMetaContainer entitySet={entitySet} />
    );

    const renderEntitySetSearchContainer = () => (
      <EntitySetSearchContainer entitySet={entitySet} />
    );

    return (
      <>
        <EntitySetOverviewContainer entitySet={entitySet} />
        <AppContentWrapper bgColor={WHITE} padding="0">
          <AppNavigationWrapper borderless>
            <NavLink exact strict to={aboutPath}>About</NavLink>
            <NavLink to={searchPath}>Search</NavLink>
          </AppNavigationWrapper>
        </AppContentWrapper>
        <Switch>
          <Route exact path={Routes.ENTITY_SET} render={renderEntitySetMetaContainer} />
          <Route exact path={Routes.ENTITY_SET_SEARCH} render={renderEntitySetSearchContainer} />
        </Switch>
      </>
    );
  }

  return null;
};

export default EntitySetRouter;
