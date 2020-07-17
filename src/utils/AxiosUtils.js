/*
 * @flow
 */

import _get from 'lodash/get';
import type { $AxiosError } from 'axios';

import type { SagaError } from '../types';

function toSagaError(error :any) :SagaError {

  const axiosError :$AxiosError<*> = error;
  if (axiosError.isAxiosError && axiosError.response) {
    const { response } = axiosError;
    return {
      message: _get(axiosError, ['data', 'errors', 0, 'message']),
      status: response.status,
      statusText: response.statusText,
    };
  }

  return {};
}

export {
  toSagaError,
};
