/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { SEARCH_ENTITY_SETS, searchEntitySets } from './SearchActions';

import { HITS, REQUEST_STATE, TOTAL_HITS } from '../redux/constants';

const INITIAL_STATE :Map = fromJS({
  [SEARCH_ENTITY_SETS]: {
    [REQUEST_STATE]: RequestStates.STANDBY,
    hits: List(),
    totalHits: 0,
  },
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case searchEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchEntitySets.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([SEARCH_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => state
          .setIn([SEARCH_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS)
          .setIn([SEARCH_ENTITY_SETS, HITS], seqAction.value[HITS])
          .setIn([SEARCH_ENTITY_SETS, TOTAL_HITS], seqAction.value[TOTAL_HITS]),
        FAILURE: () => state
          .set(HITS, List())
          .set(TOTAL_HITS, 0)
          .setIn([SEARCH_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ENTITY_SETS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
