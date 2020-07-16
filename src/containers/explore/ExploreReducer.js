/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { ReduxConstants } from 'lattice-utils';
import { matchPath } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  EXPLORE_ATLAS_DATA_SET,
  EXPLORE_ENTITY_DATA,
  EXPLORE_ENTITY_NEIGHBORS,
  EXPLORE_ENTITY_SET,
  EXPLORE_ORGANIZATION,
  exploreAtlasDataSet,
  exploreEntityData,
  exploreEntityNeighbors,
  exploreEntitySet,
  exploreOrganization,
} from './ExploreActions';

import { ReduxActions } from '../../core/redux';
import { ERROR } from '../../core/redux/constants';
import { Routes, RoutingActions } from '../../core/router';
import type { RoutingAction } from '../../core/router/RoutingActions';

const { EntitySetBuilder } = Models;
const { GO_TO_ROUTE } = RoutingActions;
const { REQUEST_STATE } = ReduxConstants;
const { RESET_REQUEST_STATE } = ReduxActions;

const RS_INITIAL_STATE = {
  [ERROR]: false,
  [REQUEST_STATE]: RequestStates.STANDBY,
};

const INITIAL_STATE :Map = fromJS({
  [EXPLORE_ATLAS_DATA_SET]: RS_INITIAL_STATE,
  [EXPLORE_ENTITY_DATA]: RS_INITIAL_STATE,
  [EXPLORE_ENTITY_NEIGHBORS]: RS_INITIAL_STATE,
  [EXPLORE_ENTITY_SET]: RS_INITIAL_STATE,
  [EXPLORE_ORGANIZATION]: RS_INITIAL_STATE,
  entityNeighborsMap: Map(),
  selectedAtlasDataSet: undefined,
  selectedEntityData: undefined,
  selectedEntitySet: undefined,
  selectOrganization: undefined,
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
      if (matchPath(routingAction.route, Routes.ATLAS_DATA_SET) && routingAction.state.atlasDataSet) {
        return state.set('selectedAtlasDataSet', routingAction.state.atlasDataSet);
      }
      return state;
    }

    case RESET_REQUEST_STATE: {
      const { path } = action;
      if (path && state.hasIn(path)) {
        return state
          .setIn([...path, ERROR], false)
          .setIn([...path, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case exploreAtlasDataSet.case(action.type): {
      const seqAction :SequenceAction = action;
      return exploreAtlasDataSet.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([EXPLORE_ATLAS_DATA_SET, REQUEST_STATE], RequestStates.PENDING)
          .setIn([EXPLORE_ATLAS_DATA_SET, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([EXPLORE_ATLAS_DATA_SET, seqAction.id])) {
            return state
              .set('selectedAtlasDataSet', fromJS(seqAction.value))
              .setIn([EXPLORE_ATLAS_DATA_SET, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set('selectedAtlasDataSet', undefined)
          .setIn([EXPLORE_ATLAS_DATA_SET, ERROR], seqAction.value)
          .setIn([EXPLORE_ATLAS_DATA_SET, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ATLAS_DATA_SET, seqAction.id]),
      });
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
          .setIn([EXPLORE_ENTITY_DATA, ERROR], seqAction.value)
          .setIn([EXPLORE_ENTITY_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ENTITY_DATA, seqAction.id]),
      });
    }

    case exploreEntityNeighbors.case(action.type): {
      const seqAction :SequenceAction = action;
      return exploreEntityNeighbors.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([EXPLORE_ENTITY_NEIGHBORS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([EXPLORE_ENTITY_NEIGHBORS, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([EXPLORE_ENTITY_NEIGHBORS, seqAction.id])) {
            const storedSeqAction = state.getIn([EXPLORE_ENTITY_NEIGHBORS, seqAction.id]);
            const { entityKeyId } = storedSeqAction.value;
            return state
              .setIn(['entityNeighborsMap', entityKeyId], seqAction.value)
              .setIn([EXPLORE_ENTITY_NEIGHBORS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([EXPLORE_ENTITY_NEIGHBORS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ENTITY_NEIGHBORS, seqAction.id]),
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
              .set('selectedEntitySet', seqAction.value)
              .setIn([EXPLORE_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set('selectedEntitySet', undefined)
          .setIn([EXPLORE_ENTITY_SET, ERROR], seqAction.value)
          .setIn([EXPLORE_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ENTITY_SET, seqAction.id]),
      });
    }

    case exploreOrganization.case(action.type): {
      const seqAction :SequenceAction = action;
      return exploreOrganization.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([EXPLORE_ORGANIZATION, REQUEST_STATE], RequestStates.PENDING)
          .setIn([EXPLORE_ORGANIZATION, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([EXPLORE_ORGANIZATION, seqAction.id])) {
            return state
              .set('selectedOrganization', seqAction.value)
              .setIn([EXPLORE_ORGANIZATION, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state
          .set('selectedOrganization', undefined)
          .setIn([EXPLORE_ORGANIZATION, ERROR], seqAction.value)
          .setIn([EXPLORE_ORGANIZATION, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([EXPLORE_ORGANIZATION, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
