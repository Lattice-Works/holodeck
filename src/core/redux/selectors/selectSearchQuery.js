/*
 * @flow
 */

import {
  Map,
  getIn,
  hasIn,
} from 'immutable';

import { QUERY, SEARCH } from '../constants';

export default function selectSearchQuery(action :string) {

  return (state :Map) :string => {

    if (hasIn(state, [SEARCH, action, QUERY])) {
      return getIn(state, [SEARCH, action, QUERY]);
    }

    return '';
  };
}
