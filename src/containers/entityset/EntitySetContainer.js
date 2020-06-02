/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper, Colors } from 'lattice-ui-kit';
import { Logger, ValidationUtils } from 'lattice-utils';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';

import EntitySetMetaContainer from './EntitySetMetaContainer';
import EntitySetOverviewContainer from './EntitySetOverviewContainer';
import EntitySetSearchContainer from './EntitySetSearchContainer';

import { Routes } from '../../core/router';
import { Errors } from '../../utils';

const { WHITE } = Colors;
const { EntitySet } = Models;
const { isValidUUID } = ValidationUtils;

const {
  ERR_INVALID_UUID,
  ERR_UNEXPECTED_STATE,
} = Errors;

type Props = {
  entitySet :EntitySet;
  entitySetId :UUID;
};

const LOG = new Logger('EntitySetContainer');

const EntitySetContainer = ({ entitySet, entitySetId } :Props) => {

  if (!isValidUUID(entitySetId)) {
    LOG.error(ERR_INVALID_UUID, entitySetId);
    return (
      <Redirect to={Routes.EXPLORE} />
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

  LOG.error(ERR_UNEXPECTED_STATE, entitySetId, entitySet);
  return null;
};

export default EntitySetContainer;
