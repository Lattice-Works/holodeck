/*
 * @flow
 */

import {
  List,
  Map,
  Set,
  fromJS,
} from 'immutable';
import { ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  CLEAR_SEARCH_STATE,
  SEARCH_ENTITY_SET,
  SEARCH_ENTITY_SETS,
  SEARCH_ORG_DATA_SETS,
  searchEntitySet,
  searchEntitySets,
  searchOrgDataSets,
} from './SearchActions';

import {
  HITS,
  PAGE,
  QUERY,
  TOTAL_HITS,
} from '../redux/constants';

const { REQUEST_STATE } = ReduxConstants;

const SEARCH_INITIAL_STATE = fromJS({
  [REQUEST_STATE]: RequestStates.STANDBY,
  [HITS]: List(),
  [PAGE]: 0,
  [QUERY]: '',
  [TOTAL_HITS]: 0,
});

const INITIAL_STATE :Map = fromJS({
  [SEARCH_ENTITY_SET]: SEARCH_INITIAL_STATE,
  [SEARCH_ENTITY_SETS]: SEARCH_INITIAL_STATE,
  [SEARCH_ORG_DATA_SETS]: {
    [REQUEST_STATE]: RequestStates.STANDBY,
    [PAGE]: 0,
    [QUERY]: '',
    [TOTAL_HITS]: 0,
    atlasDataSetIds: Set(),
    entitySetIds: Set(),
  },
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case CLEAR_SEARCH_STATE: {
      if (state.has(action.value)) {
        return state.set(action.value, SEARCH_INITIAL_STATE);
      }
      return state;
    }

    case searchEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchEntitySet.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
          .setIn([SEARCH_ENTITY_SET, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([SEARCH_ENTITY_SET, seqAction.id]);
          if (storedSeqAction) {
            const { page, query } = storedSeqAction.value;
            return state
              .setIn([SEARCH_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS)
              .setIn([SEARCH_ENTITY_SET, PAGE], page)
              .setIn([SEARCH_ENTITY_SET, QUERY], query)
              .setIn([SEARCH_ENTITY_SET, HITS], seqAction.value[HITS])
              .setIn([SEARCH_ENTITY_SET, TOTAL_HITS], seqAction.value[TOTAL_HITS]);
          }
          return state;
        },
        FAILURE: () => state
          .set(HITS, List())
          .set(TOTAL_HITS, 0)
          .setIn([SEARCH_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ENTITY_SET, seqAction.id]),
      });
    }

    case searchEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchEntitySets.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([SEARCH_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([SEARCH_ENTITY_SETS, seqAction.id]);
          if (storedSeqAction) {
            const { page, query } = storedSeqAction.value;
            return state
              .setIn([SEARCH_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS)
              .setIn([SEARCH_ENTITY_SETS, PAGE], page)
              .setIn([SEARCH_ENTITY_SETS, QUERY], query)
              .setIn([SEARCH_ENTITY_SETS, HITS], seqAction.value[HITS])
              .setIn([SEARCH_ENTITY_SETS, TOTAL_HITS], seqAction.value[TOTAL_HITS]);
          }
          return state;
        },
        FAILURE: () => state
          .set(HITS, List())
          .set(TOTAL_HITS, 0)
          .setIn([SEARCH_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ENTITY_SETS, seqAction.id]),
      });
    }

    // NOTE: THIS IS ALL TEMPORARY
    // NOTE: THIS IS ALL TEMPORARY
    // NOTE: THIS IS ALL TEMPORARY

    case searchOrgDataSets.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchOrgDataSets.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ORG_DATA_SETS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([SEARCH_ORG_DATA_SETS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([SEARCH_ORG_DATA_SETS, seqAction.id]);
          if (storedSeqAction) {
            const { page, query } = storedSeqAction.value;
            return state
              .setIn([SEARCH_ORG_DATA_SETS, REQUEST_STATE], RequestStates.SUCCESS)
              .setIn([SEARCH_ORG_DATA_SETS, PAGE], page)
              .setIn([SEARCH_ORG_DATA_SETS, QUERY], query)
              .setIn([SEARCH_ORG_DATA_SETS, 'atlasDataSetIds'], seqAction.value.atlasDataSetIds)
              .setIn([SEARCH_ORG_DATA_SETS, 'entitySetIds'], seqAction.value.entitySetIds)
              .setIn([SEARCH_ORG_DATA_SETS, TOTAL_HITS], seqAction.value[TOTAL_HITS]);
          }
          return state;
        },
        FAILURE: () => state
          .set('atlasDataSetIds', Set())
          .set('entitySetIds', Set())
          .set(TOTAL_HITS, 0)
          .setIn([SEARCH_ORG_DATA_SETS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ORG_DATA_SETS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
