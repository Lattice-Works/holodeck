/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { DataApiActions, EntitySetsApiActions } from 'lattice-sagas';
import { matchPath } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { REQUEST_STATE } from '../../core/redux/constants';
import { Routes, RoutingActions } from '../../core/router';
import type { RoutingAction } from '../../core/router/RoutingActions';

const { EntitySetBuilder } = Models;
const { GO_TO_ROUTE } = RoutingActions;
const { GET_ENTITY_DATA, getEntityData } = DataApiActions;
const { GET_ENTITY_SET, getEntitySet } = EntitySetsApiActions;

const INITIAL_STATE :Map = fromJS({
  [GET_ENTITY_SET]: { [REQUEST_STATE]: RequestStates.STANDBY },
  entityData: undefined,
  entitySet: undefined,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case GO_TO_ROUTE: {
      const routingAction :RoutingAction = action;
      if (matchPath(routingAction.route, Routes.ENTITY_SET) && routingAction.state.entitySet) {
        return state.set('entitySet', (new EntitySetBuilder(routingAction.state.entitySet)).build());
      }
      if (matchPath(routingAction.route, Routes.ENTITY_DATA) && routingAction.state.data) {
        return state.set('entityData', routingAction.state.data);
      }
      return state;
    }

    case getEntityData.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntityData.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([GET_ENTITY_DATA, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_DATA, seqAction.id], seqAction),
        SUCCESS: () => state
          .set('entityData', seqAction.value)
          .setIn([GET_ENTITY_DATA, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('entityData', undefined)
          .setIn([GET_ENTITY_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ENTITY_DATA, seqAction.id]),
      });
    }

    case getEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntitySet.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_SET, seqAction.id], seqAction),
        SUCCESS: () => state
          .set('entitySet', (new EntitySetBuilder(seqAction.value)).build())
          .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS),
        FAILURE: () => state
          .set('entitySet', undefined)
          .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ENTITY_SET, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
