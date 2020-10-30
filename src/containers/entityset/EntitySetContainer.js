/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faListAlt } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Models } from 'lattice';
import { AppContentWrapper, AppNavigationWrapper } from 'lattice-ui-kit';
import { LangUtils, Logger, ValidationUtils } from 'lattice-utils';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import type { UUID } from 'lattice';

import EntitySetMetaContainer from './EntitySetMetaContainer';
import EntitySetSearchContainer from './EntitySetSearchContainer';

import { Header } from '../../components';
import { Routes } from '../../core/router';
import { Errors } from '../../utils';

const { EntitySet } = Models;
const { isNonEmptyString } = LangUtils;
const { isValidUUID } = ValidationUtils;

const {
  ERR_INVALID_UUID,
  ERR_UNEXPECTED_STATE,
} = Errors;

const NavContentWrapper = styled(AppContentWrapper)`
  > div {
    padding: 0;
  }
`;

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
        <AppContentWrapper bgColor="white" borderless>
          <div>
            <Header as="h2">
              <FontAwesomeIcon fixedWidth icon={faListAlt} size="sm" style={{ marginRight: '20px' }} />
              <span>{entitySet.title || entitySet.name}</span>
            </Header>
          </div>
          {
            isNonEmptyString(entitySet.description) && (
              <div>{entitySet.description}</div>
            )
          }
        </AppContentWrapper>
        <NavContentWrapper bgColor="white">
          <AppNavigationWrapper borderless>
            <NavLink exact strict to={aboutPath}>About</NavLink>
            <NavLink to={searchPath}>Search</NavLink>
          </AppNavigationWrapper>
        </NavContentWrapper>
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
