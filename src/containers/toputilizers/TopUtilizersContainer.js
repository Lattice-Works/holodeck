/*
 * @flow
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { withRouter } from 'react-router-dom';

import EntitySetSearch from '../entitysets/EntitySetSearch';
import TopUtilizersEntitySetContainer from './TopUtilizersEntitySetContainer';
import * as Routes from '../../core/router/Routes';

const TopUtilizersContainer = () => (
  <Switch>
    <Route
        exact
        path={Routes.TOP_UTILIZERS}
        render={() => <EntitySetSearch actionText="search" path={Routes.TOP_UTILIZERS} />} />
    <Route path={`${Routes.TOP_UTILIZERS}/${Routes.ID_PATH}`} component={TopUtilizersEntitySetContainer} />
    <Redirect to={Routes.TOP_UTILIZERS} />
  </Switch>
);

export default withRouter(TopUtilizersContainer);
