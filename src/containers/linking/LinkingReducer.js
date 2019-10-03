/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  SEARCH_LINKED_ENTITY_SETS,
  searchLinkedEntitySets,
} from './LinkingActions';

const INITIAL_STATE :Map<*, *> = fromJS({
  [SEARCH_LINKED_ENTITY_SETS]: {
    requestState: RequestStates.STANDBY,
  },
  searchResults: Map(),
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case searchLinkedEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchLinkedEntitySets.reducer(state, seqAction, {
        REQUEST: () => state
          .set('searchResults', Map())
          .setIn([SEARCH_LINKED_ENTITY_SETS, 'requestState'], RequestStates.PENDING)
          .setIn([SEARCH_LINKED_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => state
          .set('searchResults', seqAction.value)
          .setIn([SEARCH_LINKED_ENTITY_SETS, 'requestState'], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('searchResults', Map())
          .setIn([SEARCH_LINKED_ENTITY_SETS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_LINKED_ENTITY_SETS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
