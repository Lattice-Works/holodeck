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
import StyledButton from '../../components/buttons/StyledButton';
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
  padding: 30px 170px;
  margin: 0 auto;
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

const HelloWorldComponent = () => (
  <div>
    Hello, World!
  </div>
);

const AppContainer = ({ actions } :Props) => (
  <AppWrapper>
    <HeaderNav logout={actions.logout} />
    <AppBodyWrapper>
      <Switch>
        <Route path={Routes.ROOT} component={HelloWorldComponent} />
        <Redirect to={Routes.ROOT} />
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
