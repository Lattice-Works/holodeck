/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import { Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import {
  Redirect,
  Route,
  Switch,
  withRouter,
} from 'react-router';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import AppHeaderContainer from './AppHeaderContainer';
import ExploreRouter from '../explore/ExploreRouter';
import TopUtilizersRouter from '../toputilizers/TopUtilizersRouter';
import * as AppActions from './AppActions';
import * as Routes from '../../core/router/Routes';
import { AppContentWrapper } from '../../components/layout';
import { APP_CONTAINER_MIN_WIDTH } from '../../core/style/Sizes';

const { INITIALIZE_APPLICATION } = AppActions;

const AppContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  min-width: ${APP_CONTAINER_MIN_WIDTH}px;
  padding: 0;
`;

const Error = styled.div`
  text-align: center;
`;

type Props = {
  actions :{
    initializeApplication :RequestSequence;
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

    return (
      <AppContainerWrapper>
        <AppHeaderContainer />
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
  }, dispatch)
});

export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppContainer)
);
