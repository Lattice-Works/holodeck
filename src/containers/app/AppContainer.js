/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { AuthActionFactory } from 'lattice-auth';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { bindActionCreators } from 'redux';

import HeaderNav from '../../components/nav/HeaderNav';
import ExploreContainer from '../explore/ExploreContainer';
import TopUtilizersContainer from '../toputilizers/TopUtilizersContainer';
import * as Routes from '../../core/router/Routes';

const { logout } = AuthActionFactory;

/*
 * styled components
 */

const AppWrapper = styled.div`
  background-color: #f5f5f8;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  min-width: fit-content;
  font-family: 'Open Sans', sans-serif;
`;

const AppBodyWrapper = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  margin: 45px;
  background: #ffffff;
  max-height: fit-content;
`;

/*
 * types
 */

type Props = {
  actions :{
    login :() => void;
    logout :() => void;
  };
};

const AppContainer = ({ actions } :Props) => (
  <AppWrapper>
    <AppBodyWrapper>
      <HeaderNav logout={actions.logout} />
      <Switch>
        <Route path={Routes.EXPLORE} component={ExploreContainer} />
        <Route path={Routes.TOP_UTILIZERS} component={TopUtilizersContainer} />
        <Redirect to={Routes.EXPLORE} />
      </Switch>
    </AppBodyWrapper>
  </AppWrapper>
);

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ logout }, dispatch)
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
