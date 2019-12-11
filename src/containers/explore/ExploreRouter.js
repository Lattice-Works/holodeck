/*
 * @flow
 */

import React from 'react';

import { Redirect, Route, Switch } from 'react-router';
import { withRouter } from 'react-router-dom';

import ExploreEntitySetContainer from './ExploreEntitySetContainer';

import EntityLinkingContainer from '../linking/EntityLinkingContainer';
import EntitySetSearch from '../entitysets/EntitySetSearch';
import * as Routes from '../../core/router/Routes';

const ExploreRouter = () => (
  <Switch>
    <Route exact path={Routes.EXPLORE} component={EntitySetSearch} />
    <Route path={Routes.ENTITY_LINKING} component={EntityLinkingContainer} />
    <Route path={Routes.EXPLORE_ES} component={ExploreEntitySetContainer} />
    <Redirect to={Routes.EXPLORE} />
  </Switch>
);

export default withRouter(ExploreRouter);
