/*
 * @flow
 */

import React, { useCallback, useEffect } from 'react';

import isFunction from 'lodash/isFunction';
import { AuthActions, AuthUtils } from 'lattice-auth';
import {
  AppContainerWrapper,
  AppContentWrapper,
  AppHeaderWrapper,
  AppNavigationWrapper,
  LatticeLuxonUtils,
  MuiPickersUtilsProvider,
  Spinner,
  StylesProvider,
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { LangUtils, useRequestState } from 'lattice-utils';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';

import OpenLatticeIcon from '../../assets/images/ol-icon.png';
import { BasicErrorComponent } from '../../components';
import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import { ExploreRouter } from '../explore';

declare var gtag :?Function;

const { isNonEmptyString } = LangUtils;

const AppContainer = () => {

  const dispatch = useDispatch();

  const logout = useCallback(() => {
    dispatch(AuthActions.logout());
    if (isFunction(gtag)) {
      gtag('config', GOOGLE_TRACKING_ID, { user_id: undefined, send_page_view: false });
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(initializeApplication());
  }, [dispatch]);

  const initAppRS :?RequestState = useRequestState([REDUCERS.APP, INITIALIZE_APPLICATION]);

  const userInfo = AuthUtils.getUserInfo() || {};
  let user :?string = null;
  if (isNonEmptyString(userInfo.name)) {
    user = userInfo.name;
  }
  else if (isNonEmptyString(userInfo.email)) {
    user = userInfo.email;
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
        <StylesProvider injectFirst>
          <AppContainerWrapper>
            <AppHeaderWrapper appIcon={OpenLatticeIcon} appTitle="Regallery" logout={logout} user={user}>
              <AppNavigationWrapper>
                <NavLink to={Routes.ROOT} />
                <NavLink to={Routes.EXPLORE}>Explore</NavLink>
              </AppNavigationWrapper>
            </AppHeaderWrapper>
            {
              initAppRS === RequestStates.PENDING && (
                <AppContentWrapper>
                  <Spinner size="2x" />
                </AppContentWrapper>
              )
            }
            {
              initAppRS === RequestStates.FAILURE && (
                <AppContentWrapper>
                  <BasicErrorComponent>
                    Sorry, the application failed to initialize. Please try refreshing the page, or contact support.
                  </BasicErrorComponent>
                </AppContentWrapper>
              )
            }
            {
              initAppRS === RequestStates.SUCCESS && (
                <Switch>
                  <Route path={Routes.EXPLORE} component={ExploreRouter} />
                  <Redirect to={Routes.EXPLORE} />
                </Switch>
              )
            }
          </AppContainerWrapper>
        </StylesProvider>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default AppContainer;
