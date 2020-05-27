/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { matchPath } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_SET,
  exploreEntityData,
  exploreEntitySet,
} from './ExploreActions';

import { REQUEST_STATE } from '../../core/redux/constants';
import { Routes, RoutingActions } from '../../core/router';
import type { RoutingAction } from '../../core/router/RoutingActions';

const { EntitySetBuilder } = Models;
const { GO_TO_ROUTE } = RoutingActions;

const INITIAL_STATE :Map = fromJS({
  [EXPLORE_ENTITY_DATA]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [EXPLORE_ENTITY_SET]: { [REQUEST_STATE]: RequestStates.STANDBY },
  selectedEntityData: undefined,
  selectedEntitySet: undefined,
  explorationPath: [],
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case GO_TO_ROUTE: {
      const routingAction :RoutingAction = action;
      if (matchPath(routingAction.route, Routes.ENTITY_SET) && routingAction.state.entitySet) {
        return state.set('selectedEntitySet', (new EntitySetBuilder(routingAction.state.entitySet)).build());
      }
      if (matchPath(routingAction.route, Routes.ENTITY_DATA) && routingAction.state.data) {
        return state.set('selectedEntityData', routingAction.state.data);
      }
      return state;
    }

    case exploreEntityData.case(action.type): {
      const seqAction :SequenceAction = action;
      return exploreEntityData.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.PENDING)
          .setIn([EXPLORE_ENTITY_DATA, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([EXPLORE_ENTITY_DATA, seqAction.id])) {
            return state
              .set('selectedEntityData', seqAction.value)
              .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set('selectedEntityData', undefined)
          .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ENTITY_DATA, seqAction.id]),
      });
    }

    case exploreEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return exploreEntitySet.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([EXPLORE_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
          .setIn([EXPLORE_ENTITY_SET, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([EXPLORE_ENTITY_SET, seqAction.id])) {
            return state
              .set('selectedEntitySet', seqAction.value.entitySet)
              .setIn([EXPLORE_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set('selectedEntitySet', undefined)
          .setIn([EXPLORE_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ENTITY_SET, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
