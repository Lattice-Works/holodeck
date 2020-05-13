/*
 * @flow
 */

import { useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { REQUEST_STATE } from '../../core/redux/constants';

const useRequestState = (reducer :string, action :string) :?RequestState => {

  const requestState = useSelector((state) => state.getIn([reducer, action, REQUEST_STATE]));
  if (RequestStates[requestState]) {
    return requestState;
  }

  return undefined;
};

export default useRequestState;
