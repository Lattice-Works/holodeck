/*
 * @flow
 */

import { Map, fromJS } from 'immutable';
import { RequestStates } from 'redux-reqseq';
import type { SequenceAction } from 'redux-reqseq';

import { FETCH_ENTITY_SET_DATA, fetchEntitySetData } from './DataActions';
import { getEntityKeyId } from './DataUtils';

import { REQUEST_STATE } from '../redux/constants';

const INITIAL_STATE :Map = fromJS({
  [FETCH_ENTITY_SET_DATA]: { [REQUEST_STATE]: RequestStates.STANDBY },
  entitySetDataMap: Map(),
});

export default function reducer(state :Map = INITIAL_STATE, action :Object) {

  switch (action.type) {


    case fetchEntitySetData.case(action.type): {
      const seqAction :SequenceAction = action;
      return fetchEntitySetData.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([FETCH_ENTITY_SET_DATA, REQUEST_STATE], RequestStates.PENDING)
          .setIn([FETCH_ENTITY_SET_DATA, seqAction.id], seqAction),
        SUCCESS: () => {

          if (state.hasIn([FETCH_ENTITY_SET_DATA, seqAction.id])) {

            const storedSeqAction = state.getIn([FETCH_ENTITY_SET_DATA, seqAction.id]);
            const { entityKeyIds, entitySetId } = storedSeqAction.value;

            let entitySetDataMap = state.get('entitySetDataMap');
            fromJS(seqAction.value).forEach((entity :Map) => {
              const entityKeyId :?UUID = getEntityKeyId(entity);
              if (entityKeyIds.has(entityKeyId)) {
                entitySetDataMap = entitySetDataMap.setIn([entitySetId, entityKeyId], entity);
              }
            });

            return state
              .set('entitySetDataMap', entitySetDataMap)
              .setIn([FETCH_ENTITY_SET_DATA, REQUEST_STATE], RequestStates.SUCCESS);
          }
          return state;
        },
        FAILURE: () => state.setIn([FETCH_ENTITY_SET_DATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([FETCH_ENTITY_SET_DATA, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
