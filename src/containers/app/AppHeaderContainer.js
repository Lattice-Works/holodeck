/*
 * @flow
 */

import React, { Component } from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { Map } from 'immutable';
import { AuthActions } from 'lattice-auth';
import { Button, Colors } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import AppNavigationContainer from './AppNavigationContainer';
import OpenLatticeLogo from '../../assets/images/logo.png';
import * as AppActions from './AppActions';
import * as Routes from '../../core/router/Routes';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_MIN_WIDTH,
  APP_CONTENT_PADDING,
} from '../../core/style/Sizes';

declare var gtag :?Function;

const { NEUTRALS, WHITE } = Colors;

const AppHeaderOuterWrapper = styled.div`
  background-color: ${WHITE};
  border-bottom: 1px solid ${NEUTRALS[5]};
  display: flex;
  flex: 0 0 auto;
  justify-content: center;
`;

const AppHeaderInnerWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  justify-content: space-between;
  max-width: ${APP_CONTAINER_MAX_WIDTH}px;
  min-width: ${APP_CONTAINER_MIN_WIDTH}px;
  padding: 0 ${APP_CONTENT_PADDING}px;
`;

const LeftSideContentWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  height: 100%;
  justify-content: flex-start;
`;

const RightSideContentWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
`;

const LogoTitleWrapperLink = styled(Link)`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex: 0 0 auto;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    outline: none;
    text-decoration: none;
  }
`;

const AppLogoIcon = styled.img.attrs({
  alt: 'OpenLattice Logo Icon',
  src: OpenLatticeLogo,
})`
  height: 26px;
`;

const AppTitle = styled.h1`
  color: ${NEUTRALS[0]};
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 0 10px;
`;

// total button height
// line-height + padding + border
// 18 + 2*8px + 2*1px = 36px
const LogoutButton = styled(Button)`
  border: solid 1px ${NEUTRALS[4]};
  font-size: 12px;
  line-height: 18px;
  padding: 8px 16px;
  width: 100px;
`;

const LogoutButtonWrapper = styled.div`
  padding: 12px 0;
`;

type Props = {
  actions :{
    logout :() => void;
  };
};

class AppHeaderContainer extends Component<Props> {

  handleOnClickLogOut = () => {

    const { actions } = this.props;
    actions.logout();

    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }

  renderLeftSideContent = () => (
    <LeftSideContentWrapper>
      <LogoTitleWrapperLink to={Routes.ROOT}>
        <AppLogoIcon />
        <AppTitle>
          Holodeck
        </AppTitle>
      </LogoTitleWrapperLink>
      <AppNavigationContainer />
    </LeftSideContentWrapper>
  )

  renderRightSideContent = () => (
    <RightSideContentWrapper>
      <LogoutButtonWrapper>
        <LogoutButton onClick={this.handleOnClickLogOut}>Log Out</LogoutButton>
      </LogoutButtonWrapper>
    </RightSideContentWrapper>
  )

  render() {

    return (
      <AppHeaderOuterWrapper>
        <AppHeaderInnerWrapper>
          { this.renderLeftSideContent() }
          { this.renderRightSideContent() }
        </AppHeaderInnerWrapper>
      </AppHeaderOuterWrapper>
    );
  }
}

const mapStateToProps = (state :Map<*, *>) => ({
  initAppRequestState: state.getIn(['app', AppActions.INITIALIZE_APPLICATION, 'requestState']),
});

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    logout: AuthActions.logout,
  }, dispatch)
});

// $FlowFixMe
export default withRouter(
  connect(mapStateToProps, mapActionsToProps)(AppHeaderContainer)
);
