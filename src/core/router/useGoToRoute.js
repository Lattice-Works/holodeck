/*
 * @flow
 */

import { useCallback } from 'react';

import { useDispatch } from 'react-redux';

import { goToRoute } from './RoutingActions';

const useGoToRoute = (to :string, state :any) => {
  const dispatch = useDispatch();
  return useCallback(() => dispatch(goToRoute(to, state)), [dispatch, state, to]);
};

export default useGoToRoute;
