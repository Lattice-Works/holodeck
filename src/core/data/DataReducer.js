/*
 * @flow
 */

import { Map, Set, fromJS } from 'immutable';
import { Models } from 'lattice';
import { DataUtils, ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import {
  FETCH_ATLAS_DATA_SET_DATA,
  FETCH_ENTITY_SET_DATA,
  fetchAtlasDataSetData,
  fetchEntitySetData,
} from './DataActions';

import { ReduxActions } from '../redux';

const { EntitySet } = Models;
const { getEntityKeyId } = DataUtils;
const { RESET_REQUEST_STATE } = ReduxActions;
const { REQUEST_STATE } = ReduxConstants;

const INITIAL_STATE :Map = fromJS({
  [FETCH_ATLAS_DATA_SET_DATA]: Map(),
  [FETCH_ENTITY_SET_DATA]: Map(),
  // data map structure:
  //   [orgId, entitySetId, entityKeyId]: entity data
  //   [orgId, atlasDataSetId]: atlas data set data
  data: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case RESET_REQUEST_STATE: {
      const { path } = action;
      if (path && state.hasIn(path)) {
        return state.setIn([...path, REQUEST_STATE], RequestStates.STANDBY);
      }
      return state;
    }

    case fetchAtlasDataSetData.case(action.type): {
      const seqAction :SequenceAction = action;
      return fetchAtlasDataSetData.reducer(state, seqAction, {
        REQUEST: () => {
          const { atlasDataSetId } = seqAction.value;
          return state
            .setIn([FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId, REQUEST_STATE], RequestStates.PENDING)
            .setIn([FETCH_ATLAS_DATA_SET_DATA, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          if (state.hasIn([FETCH_ATLAS_DATA_SET_DATA, seqAction.id])) {

            const storedSeqAction = state.getIn([FETCH_ATLAS_DATA_SET_DATA, seqAction.id]);
            const { atlasDataSetId, organizationId } :{
              atlasDataSetId :UUID;
              organizationId :UUID;
            } = storedSeqAction.value;

            return state
              .setIn(['data', organizationId, atlasDataSetId], fromJS(seqAction.value))
              .setIn([FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => {

          if (state.hasIn([FETCH_ATLAS_DATA_SET_DATA, seqAction.id])) {
            const storedSeqAction = state.getIn([FETCH_ATLAS_DATA_SET_DATA, seqAction.id]);
            const { atlasDataSetId } = storedSeqAction.value;
            return state.setIn([FETCH_ATLAS_DATA_SET_DATA, atlasDataSetId, REQUEST_STATE], RequestStates.FAILURE);
          }

          return state;
        },
        FINALLY: () => state.deleteIn([FETCH_ATLAS_DATA_SET_DATA, seqAction.id]),
      });
    }

    case fetchEntitySetData.case(action.type): {
      const seqAction :SequenceAction = action;
      return fetchEntitySetData.reducer(state, seqAction, {
        REQUEST: () => {
          const { entitySet } = seqAction.value;
          return state
            .setIn([FETCH_ENTITY_SET_DATA, entitySet.id, REQUEST_STATE], RequestStates.PENDING)
            .setIn([FETCH_ENTITY_SET_DATA, seqAction.id], seqAction);
        },
        SUCCESS: () => {

          if (state.hasIn([FETCH_ENTITY_SET_DATA, seqAction.id])) {

            const storedSeqAction = state.getIn([FETCH_ENTITY_SET_DATA, seqAction.id]);
            const { entityKeyIds, entitySet } :{
              entityKeyIds :Set<UUID>;
              entitySet :EntitySet;
            } = storedSeqAction.value;

            let data :Map = state.get('data');
            fromJS(seqAction.value).forEach((entityData :Map) => {
              const entityKeyId :?UUID = getEntityKeyId(entityData);
              if (entityKeyIds.has(entityKeyId)) {
                data = data.setIn([entitySet.organizationId, entitySet.id, entityKeyId], entityData);
              }
            });

            return state
              .set('data', data)
              .setIn([FETCH_ENTITY_SET_DATA, entitySet.id, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => {

          if (state.hasIn([FETCH_ENTITY_SET_DATA, seqAction.id])) {
            const storedSeqAction = state.getIn([FETCH_ENTITY_SET_DATA, seqAction.id]);
            const { entitySet } = storedSeqAction.value;
            return state.setIn([FETCH_ENTITY_SET_DATA, entitySet.id, REQUEST_STATE], RequestStates.FAILURE);
          }

          return state;
        },
        FINALLY: () => state.deleteIn([FETCH_ENTITY_SET_DATA, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
