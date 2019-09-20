/*
 * @flow
 */

import React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { withRouter } from 'react-router-dom';

import EntitySetSearch from '../entitysets/EntitySetSearch';
import TopUtilizersEntitySetContainer from './TopUtilizersEntitySetContainer';
import * as Routes from '../../core/router/Routes';

const TopUtilizersRouter = () => (
  <Switch>
    <Route exact path={Routes.TOP_UTILIZERS} component={EntitySetSearch} />
    <Route path={Routes.TOP_UTILIZERS_ES} component={TopUtilizersEntitySetContainer} />
    <Redirect to={Routes.TOP_UTILIZERS} />
  </Switch>
);

export default withRouter(TopUtilizersRouter);
