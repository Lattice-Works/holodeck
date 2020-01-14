/*
 * @flow
 */

import React, { Component } from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { NavLink } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as AppActions from './AppActions';

import ExploreRouter from '../explore/ExploreRouter';
import OpenLatticeLogo from '../../assets/images/logo.png';
import TopUtilizersRouter from '../toputilizers/TopUtilizersRouter';
import * as Routes from '../../core/router/Routes';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import { isNonEmptyString } from '../../utils/LangUtils';

declare var gtag :?Function;

const { INITIALIZE_APPLICATION } = AppActions;

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    initializeApplication :RequestSequence;
    logout :() => void;
  };
  requestStates :{
    INITIALIZE_APPLICATION :RequestState;
  };
};

class AppContainer extends Component<Props> {

  componentDidMount() {

    const { actions } = this.props;
    actions.initializeApplication();
  }

  logout = () => {

    const { actions } = this.props;
    actions.logout();

    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  renderAppContent = () => {

    const { requestStates } = this.props;

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.SUCCESS) {
      return (
        <Switch>
          <Route path={Routes.EXPLORE} component={ExploreRouter} />
          <Route path={Routes.TOP_UTILIZERS} component={TopUtilizersRouter} />
          <Redirect to={Routes.EXPLORE} />
        </Switch>
      );
    }

    if (requestStates[INITIALIZE_APPLICATION] === RequestStates.FAILURE) {
      return (
        <AppContentWrapper>
          <Error>
            Sorry, something went wrong. Please try refreshing the page, or contact support.
          </Error>
        </AppContentWrapper>
      );
    }

    return (
      <AppContentWrapper>
        <Spinner size="2x" />
      </AppContentWrapper>
    );
  }

  render() {

    const userInfo = AuthUtils.getUserInfo();
    let user = null;
    if (isNonEmptyString(userInfo.name)) {
      user = userInfo.name;
    }
    else if (isNonEmptyString(userInfo.email)) {
      user = userInfo.email;
    }

    return (
      <AppContainerWrapper>
        <AppHeaderWrapper appIcon={OpenLatticeLogo} appTitle="Holodeck" logout={this.logout} user={user}>
          <AppNavigationWrapper>
            <NavLink to={Routes.ROOT} />
            <NavLink to={Routes.EXPLORE}>Data Explorer</NavLink>
            <NavLink to={Routes.TOP_UTILIZERS}>Top Utilizers</NavLink>
          </AppNavigationWrapper>
        </AppHeaderWrapper>
        { this.renderAppContent() }
      </AppContainerWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  requestStates: {
    [INITIALIZE_APPLICATION]: state.getIn(['app', INITIALIZE_APPLICATION, 'requestState']),
  }
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    initializeApplication: AppActions.initializeApplication,
    logout: AuthActions.logout,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppContainer)
);
