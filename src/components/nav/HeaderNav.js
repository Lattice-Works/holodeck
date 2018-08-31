/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Link, NavLink } from 'react-router-dom';
import { AuthUtils } from 'lattice-auth';

import BasicButton from '../buttons/BasicButton';
import logo from '../../assets/images/logo.jpg';

import * as Routes from '../../core/router/Routes';

const AppHeaderWrapper = styled.header`
  align-items: center;
  justify-content: space-between;
  padding: 13px 30px;
  background-color: #fefefe;
  border-bottom: 1px solid #e6e6eb;
  display: flex;
  flex-direction: row;
  position: relative;
`;

const AppHeaderSubWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  justify-content: space-between;
`;

const BrandLink = styled(Link)`
  color: inherit;
  display: flex;
  flex-direction: row;
  align-items: center;
  text-decoration: none;

  span {
    font-family: Chivo;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: normal;
    color: #2e2e34;
    margin-left: 10px;
  }

  &:hover {
    color: inherit;
    text-decoration: none;
  }

  &:focus {
    color: inherit;
    text-decoration: none;
  }
`;

const DisplayName = styled.span`
  margin-right: 10px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: #2e2e34;
`;

const Logo = styled.img`
  display: inline-block;
  max-height: 29px;
`;

const StyledNavWrapper = styled.div`
  width: 100%;
  margin: 0 30px;
  display: flex;
  flex-direction: row;
  align-self: flex-start;
  justify-content: flex-start;
`;

const StyledNavLink = styled(NavLink).attrs({
  activeStyle: {
    color: '#6124e2',
    borderBottom: '3px solid #6124e2'
  }
})`
  width: auto;
  height: auto;
  padding-bottom: 10px;
  margin: 0 15px -43px 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: normal;
  color: #8e929b;
  display: flex;
  align-items: center;
  text-decoration: none;


  &:hover {
    color: #6124e2;
    text-decoration: none;

    svg {
      g {
        fill: #6124e2;
      }
    }
  }

  &:active {
    color: #361876;

    svg {
      g {
        fill: #361876;
      }
    }
  }

  &:focus {
    outline: none;
    text-decoration: none;
    svg {
      g {
        fill: #6124e2;
      }
    }

  }
`;

const LogoutButton = styled(BasicButton)`
  width: 108px;
  height: 29px;
  font-size: 11px;
  padding: 0;
`;

type NavButtonProps = {
  path :string,
  label :string
};

const NavButton = ({ path, label } :NavButtonProps) => (
  <StyledNavLink to={path} name={path}>
    <span>{label}</span>
  </StyledNavLink>
);

const getDisplayName = () => {
  const userInfo = AuthUtils.getUserInfo();
  return (userInfo.email && userInfo.email.length > 0) ? userInfo.email : '';
};

type HeaderNavProps = {
  logout :() => void
}

const HeaderNav = ({ logout } :HeaderNavProps) => (
  <div>
    <AppHeaderWrapper>
      <AppHeaderSubWrapper>
        <BrandLink to={Routes.EXPLORE}>
          <Logo src={logo} role="presentation" />
          <span>Holodeck</span>
        </BrandLink>
        <StyledNavWrapper>
          <NavButton
              path={Routes.EXPLORE}
              label="Data Explorer" />
          <NavButton
              path={Routes.TOP_UTILIZERS}
              label="Top Utilizers" />
          <NavButton
              path={Routes.REPORTS}
              label="Reports" />
          <NavButton
              path={Routes.MANAGE}
              label="Data Management" />
        </StyledNavWrapper>
        <div>
          <DisplayName>{getDisplayName()}</DisplayName>
          <LogoutButton onClick={logout}>Log Out</LogoutButton>
        </div>
      </AppHeaderSubWrapper>
    </AppHeaderWrapper>
  </div>
);

export default HeaderNav;
