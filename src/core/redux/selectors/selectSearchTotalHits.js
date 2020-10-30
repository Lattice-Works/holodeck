/*
 * @flow
 */

import {
  Map,
  getIn,
  hasIn,
} from 'immutable';

import { SEARCH, TOTAL_HITS } from '../constants';

export default function selectSearchTotalHits(action :string) {

  return (state :Map) :number => {

    if (hasIn(state, [SEARCH, action, TOTAL_HITS])) {
      return getIn(state, [SEARCH, action, TOTAL_HITS]);
    }

    return 0;
  };
}
