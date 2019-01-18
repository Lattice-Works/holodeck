/*
 * @flow
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { withRouter } from 'react-router-dom';

import ExploreEntitySetContainer from './ExploreEntitySetContainer';
import EntitySetSearch from '../entitysets/EntitySetSearch';
import * as Routes from '../../core/router/Routes';

const ExploreContainer = () => (
  <Switch>
    <Route
        exact
        path={Routes.EXPLORE}
        render={() => <EntitySetSearch actionText="search" path={Routes.EXPLORE} />} />
    <Route path={`${Routes.EXPLORE}${Routes.ID}`} component={ExploreEntitySetContainer} />
    <Redirect to={Routes.EXPLORE} />
  </Switch>
);

export default withRouter(ExploreContainer);
