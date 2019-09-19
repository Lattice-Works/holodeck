/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { ENTITY_SETS } from '../../utils/constants/StateConstants';
import {
  SEARCH_ENTITY_SETS,
  SELECT_ENTITY_SET,
  SELECT_ENTITY_SET_PAGE,
  SET_SHOW_ASSOCIATION_ENTITY_SETS,
  SET_SHOW_AUDIT_ENTITY_SETS,
  loadEntitySetSizes,
  searchEntitySets,
  selectEntitySetById
} from './EntitySetActions';

import { UNMOUNT_EXPLORE } from '../explore/ExploreActionFactory';
import { UNMOUNT_TOP_UTILIZERS } from '../toputilizers/TopUtilizersActionFactory';

const {
  ENTITY_SET_SEARCH_RESULTS,
  ENTITY_SET_SIZES,
  IS_LOADING_ENTITY_SETS,
  SELECTED_ENTITY_SET,
  SHOW_ASSOCIATION_ENTITY_SETS,
  SHOW_AUDIT_ENTITY_SETS,
  PAGE,
  TOTAL_HITS
} = ENTITY_SETS;

const INITIAL_STATE :Map = fromJS({
  [SEARCH_ENTITY_SETS]: {
    requestState: RequestStates.STANDBY,
  },
  [IS_LOADING_ENTITY_SETS]: false,
  [ENTITY_SET_SEARCH_RESULTS]: List(),
  [ENTITY_SET_SIZES]: Map(),
  [SELECTED_ENTITY_SET]: undefined,
  [SHOW_ASSOCIATION_ENTITY_SETS]: false,
  [SHOW_AUDIT_ENTITY_SETS]: false,
  [PAGE]: 1,
  [TOTAL_HITS]: 0,
});

function reducer(state :Map<> = INITIAL_STATE, action :Object) {
  switch (action.type) {

    case searchEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return searchEntitySets.reducer(state, action, {
        REQUEST: () => state
          .setIn([SEARCH_ENTITY_SETS, 'requestState'], RequestStates.PENDING)
          .setIn([SEARCH_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => {
          const storedSeqAction :SequenceAction = state.getIn([SEARCH_ENTITY_SETS, seqAction.id]);
          if (storedSeqAction) {
            return state
              .set(ENTITY_SET_SEARCH_RESULTS, seqAction.value.get('hits', List()))
              .set(TOTAL_HITS, seqAction.value.get('numHits', 0))
              .setIn([SEARCH_ENTITY_SETS, 'requestState'], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set(ENTITY_SET_SEARCH_RESULTS, List())
          .set(TOTAL_HITS, 0)
          .setIn([SEARCH_ENTITY_SETS, 'requestState'], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([SEARCH_ENTITY_SETS, seqAction.id]),
      });
    }

    case loadEntitySetSizes.case(action.type): {
      return loadEntitySetSizes.reducer(state, action, {
        SUCCESS: () => state.set(ENTITY_SET_SIZES, state.get(ENTITY_SET_SIZES).merge(fromJS(action.value))),
      });
    }

    case selectEntitySetById.case(action.type): {
      return selectEntitySetById.reducer(state, action, {
        SUCCESS: () => state.set(SELECTED_ENTITY_SET, fromJS(action.value))
      });
    }

    case SELECT_ENTITY_SET:
      return state.set(SELECTED_ENTITY_SET, action.value);

    case SELECT_ENTITY_SET_PAGE:
      return state.set(PAGE, action.value);

    case SET_SHOW_ASSOCIATION_ENTITY_SETS:
      return state.set(SHOW_ASSOCIATION_ENTITY_SETS, action.value);

    case SET_SHOW_AUDIT_ENTITY_SETS:
      return state.set(SHOW_AUDIT_ENTITY_SETS, action.value);

    case UNMOUNT_EXPLORE:
    case UNMOUNT_TOP_UTILIZERS:
      return INITIAL_STATE;

    default:
      return state;
  }
}

export default reducer;
