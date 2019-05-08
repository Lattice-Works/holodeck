/*
 * @flow
 */

import React from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { AuthActions } from 'lattice-auth';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { bindActionCreators } from 'redux';

import HeaderNav from '../../components/nav/HeaderNav';
import ExploreContainer from '../explore/ExploreContainer';
import TopUtilizersContainer from '../toputilizers/TopUtilizersContainer';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import { STATE, EDM } from '../../utils/constants/StateConstants';
import { loadEdm } from '../edm/EdmActionFactory';
import * as Routes from '../../core/router/Routes';

declare var gtag :?Function;

const { logout } = AuthActions;

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
  max-height: fit-content;
`;

/*
 * types
 */

type Props = {
  edmWasLoaded :boolean,
  actions :{
    login :() => void;
    logout :() => void;
    loadEdm :() => void;
  };
};

class AppContainer extends React.Component<Props> {

  componentDidMount() {
    const { actions, edmWasLoaded } = this.props;

    if (!edmWasLoaded) {
      actions.loadEdm();
    }

  }

  handleOnClickLogOut = () => {

    const { actions } = this.props;
    actions.logout();

    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  render() {
    return (
      <AppWrapper>
        <AppBodyWrapper>
          <HeaderNav logout={this.handleOnClickLogOut} />
          <Switch>
            <Route path={Routes.EXPLORE} component={ExploreContainer} />
            <Route path={Routes.TOP_UTILIZERS} component={TopUtilizersContainer} />
            <Redirect to={Routes.TOP_UTILIZERS} />
          </Switch>
        </AppBodyWrapper>
      </AppWrapper>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const edm = state.get(STATE.EDM);

  return {
    edmWasLoaded: edm.get(EDM.EDM_WAS_LOADED)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {

  return {
    actions: bindActionCreators({ logout, loadEdm }, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
