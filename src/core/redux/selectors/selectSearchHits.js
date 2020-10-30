/*
 * @flow
 */

import {
  Map,
  Set,
  getIn,
  hasIn,
} from 'immutable';
import type { UUID } from 'lattice';

import { HITS, SEARCH } from '../constants';

const EMPTY_SET = Set();

export default function selectSearchHits(action :string) {

  return (state :Map) :Set<UUID> => {

    if (hasIn(state, [SEARCH, action, HITS])) {
      return getIn(state, [SEARCH, action, HITS]);
    }

    return EMPTY_SET;
  };
}
