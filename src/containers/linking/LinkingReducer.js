/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { DataApiActions } from 'lattice-sagas';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  SEARCH_LINKED_ENTITY_SETS,
  searchLinkedEntitySets,
} from './LinkingActions';

const {
  GET_LINKED_ENTITY_SET_BREAKDOWN,
  getLinkedEntitySetBreakdown,
} = DataApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  [GET_LINKED_ENTITY_SET_BREAKDOWN]: {
    requestState: RequestStates.STANDBY,
  },
  [SEARCH_LINKED_ENTITY_SETS]: {
    requestState: RequestStates.STANDBY,
  },
  links: Map(),
  searchResults: Map(),
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getLinkedEntitySetBreakdown.case(action.type): {
      return getLinkedEntitySetBreakdown.reducer(state, action, {
        REQUEST: () => {
          const seqAction :SequenceAction = action;
          return state
            .setIn([GET_LINKED_ENTITY_SET_BREAKDOWN, 'requestState'], RequestStates.PENDING)
            .setIn([GET_LINKED_ENTITY_SET_BREAKDOWN, seqAction.id], seqAction);
        },
        SUCCESS: () => {
          const seqAction :SequenceAction = action;
          const storedSeqAction :SequenceAction = state.getIn([GET_LINKED_ENTITY_SET_BREAKDOWN, seqAction.id]);
          if (storedSeqAction) {
            return state
              .set('links', fromJS(action.value))
              .setIn([GET_LINKED_ENTITY_SET_BREAKDOWN, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .setIn([GET_LINKED_ENTITY_SET_BREAKDOWN, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => {
          const seqAction :SequenceAction = action;
          return state.deleteIn([GET_LINKED_ENTITY_SET_BREAKDOWN, seqAction.id]);
        },
      });
    }

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
