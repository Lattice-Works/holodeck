/*
 * @flow
 */

import {
  Map,
  getIn,
  hasIn,
} from 'immutable';

import { PAGE, SEARCH } from '../constants';

export default function selectSearchPage(action :string) {

  return (state :Map) :number => {

    if (hasIn(state, [SEARCH, action, PAGE])) {
      return getIn(state, [SEARCH, action, PAGE]);
    }

    return 0;
  };
}
