/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { OrganizationsApiActions } from 'lattice-sagas';
import { Logger } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { OrganizationObject } from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import { ReduxActions } from '../redux';
import { REQUEST_STATE } from '../redux/constants';

const LOG = new Logger('OrgsReducer');

const { OrganizationBuilder } = Models;
const { GET_ALL_ORGANIZATIONS, getAllOrganizations } = OrganizationsApiActions;

const { RESET_REQUEST_STATE } = ReduxActions;

const INITIAL_STATE :Map = fromJS({
  [GET_ALL_ORGANIZATIONS]: { [REQUEST_STATE]: RequestStates.STANDBY },
  organizationsMap: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { path } = action;
      if (path && state.hasIn(path)) {
        return state.setIn([...path, [REQUEST_STATE]], RequestStates.STANDBY);
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

    default:
      return state;
  }
}
