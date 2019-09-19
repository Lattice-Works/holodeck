/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';

import * as Routes from '../../core/router/Routes';

const { NEUTRALS, PURPLES } = Colors;

const NavigationContentWrapper = styled.nav`
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-start;
  margin-left: 30px;
`;

const NavLinkWrapper = styled(NavLink).attrs({
  activeClassName: 'active'
})`
  align-items: center;
  border-bottom: 3px solid transparent;
  color: ${NEUTRALS[1]};
  display: flex;
  font-size: 12px;
  letter-spacing: 0;
  margin-right: 30px;
  outline: none;
  padding: 13px 2px 10px 2px;
  text-align: left;
  text-decoration: none;

  &:focus {
    text-decoration: none;
  }

  &:hover {
    color: ${NEUTRALS[0]};
    cursor: pointer;
    outline: none;
    text-decoration: none;
  }

  &.active {
    border-bottom: 3px solid ${PURPLES[1]};
    color: ${PURPLES[1]};
  }
`;

const AppNavigationContainer = () => (
  <NavigationContentWrapper>
    <NavLinkWrapper to={Routes.EXPLORE}>
      Data Explorer
    </NavLinkWrapper>
    <NavLinkWrapper to={Routes.TOP_UTILIZERS}>
      Top Utilizers
    </NavLinkWrapper>
  </NavigationContentWrapper>
);

// $FlowFixMe
export default withRouter(AppNavigationContainer);
