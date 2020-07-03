/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { DataSetsApiActions, OrganizationsApiActions } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import { matchPath } from 'react-router';
import { RequestStates } from 'redux-reqseq';
import type { OrganizationObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ReduxActions } from '../../core/redux';
import { REQUEST_STATE } from '../../core/redux/constants';
import { Routes, RoutingActions } from '../../core/router';
import type { RoutingAction } from '../../core/router/RoutingActions';

const LOG = new Logger('OrgsReducer');

const { OrganizationBuilder } = Models;
const { GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, getOrganizationDataSetsWithColumns } = DataSetsApiActions;
const { GET_ALL_ORGANIZATIONS, getAllOrganizations } = OrganizationsApiActions;

const { RESET_REQUEST_STATE } = ReduxActions;
const { GO_TO_ROUTE } = RoutingActions;

const INITIAL_STATE :Map = fromJS({
  [GET_ALL_ORGANIZATIONS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  organizationsMap: Map(),
  selectedAtlasDataSet: undefined,
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case GO_TO_ROUTE: {
      const routingAction :RoutingAction = action;
      if (matchPath(routingAction.route, Routes.ATLAS_DATA_SET) && routingAction.state.dataSet) {
        return state.set('selectedAtlasDataSet', routingAction.state.dataSet);
      }
      return state;
    }

    case RESET_REQUEST_STATE: {
      const { path } = action;
      if (path && state.hasIn(path)) {
        return state.setIn([...path, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case getAllOrganizations.case(action.type): {
      const seqAction :SequenceAction = action;
      return getAllOrganizations.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ALL_ORGANIZATIONS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ALL_ORGANIZATIONS, seqAction.id], seqAction),
        SUCCESS: () => {

          const rawOrganizations :OrganizationObject[] = seqAction.value;
          const organizations :Map = Map().asMutable();
          rawOrganizations.forEach((o :OrganizationObject) => {
            try {
              const org = (new OrganizationBuilder(o)).build();
              organizations.set(org.id, org);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, o);
            }
          });

          return state
            .set('organizationsMap', organizations.asImmutable())
            .setIn([GET_ALL_ORGANIZATIONS, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('organizationsMap', Map())
          .setIn([GET_ALL_ORGANIZATIONS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ALL_ORGANIZATIONS, seqAction.id]),
      });
    }

    case getOrganizationDataSetsWithColumns.case(action.type): {
      const seqAction :SequenceAction = action;
      return getOrganizationDataSetsWithColumns.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, seqAction.id], seqAction),
        SUCCESS: () => {
          if (state.hasIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, seqAction.id])) {
            const storedSeqAction = state.getIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, seqAction.id]);
            const organizationId = storedSeqAction.value;
            return state
              .setIn(['atlasDataSets', organizationId], fromJS(seqAction.value))
              .setIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
