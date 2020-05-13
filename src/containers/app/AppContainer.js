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
  ThemeProvider,
  lightTheme,
} from 'lattice-ui-kit';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { NavLink } from 'react-router-dom';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { INITIALIZE_APPLICATION, initializeApplication } from './AppActions';

import OpenLatticeLogo from '../../assets/images/ol-icon.png';
import { useRequestState } from '../../components/hooks';
import { REDUCERS } from '../../core/redux/constants';
import { Routes } from '../../core/router';
import { GOOGLE_TRACKING_ID } from '../../core/tracking/google/GoogleAnalytics';
import { LangUtils } from '../../utils';
import { EntitySetRouter } from '../entityset';
import { ExploreContainer } from '../explore';

declare var gtag :?Function;

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

  const initAppRS :?RequestState = useRequestState(REDUCERS.APP, INITIALIZE_APPLICATION);

  const userInfo = AuthUtils.getUserInfo() || {};
  let user :?string = null;
  if (LangUtils.isNonEmptyString(userInfo.name)) {
    user = userInfo.name;
  }
  else if (LangUtils.isNonEmptyString(userInfo.email)) {
    user = userInfo.email;
  }

  return (
    <ThemeProvider theme={lightTheme}>
      <MuiPickersUtilsProvider utils={LatticeLuxonUtils}>
        <AppContainerWrapper>
          <AppHeaderWrapper appIcon={OpenLatticeLogo} appTitle="Holodeck" logout={logout} user={user}>
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
                Sorry, the application failed to initialize. Please try refreshing the page, or contact support.
              </AppContentWrapper>
            )
          }
          {
            initAppRS === RequestStates.SUCCESS && (
              <Switch>
                <Route path={Routes.EXPLORE} component={ExploreContainer} />
                <Route path={Routes.ENTITY_SET} component={EntitySetRouter} />
                <Redirect to={Routes.EXPLORE} />
              </Switch>
            )
          }
        </AppContainerWrapper>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  );
};

export default AppContainer;
