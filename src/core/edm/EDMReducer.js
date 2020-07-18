/*
 * @flow
 */

import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { EntitySetsApiActions } from 'lattice-sagas';
import { Logger, ReduxConstants } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type {
  EntitySetObject,
  EntityTypeObject,
  PropertyTypeObject,
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import {
  GET_EDM_TYPES,
  GET_ENTITY_SETS_WITH_METADATA,
  getEntityDataModelTypes,
  getEntitySetsWithMetaData,
} from './EDMActions';

const { REQUEST_STATE } = ReduxConstants;

const LOG = new Logger('EDMReducer');

const {
  EntitySet,
  EntitySetBuilder,
  EntityTypeBuilder,
  PropertyTypeBuilder,
} = Models;

const {
  GET_ENTITY_SET,
  GET_ENTITY_SETS,
  getEntitySet,
  getEntitySets,
} = EntitySetsApiActions;

const INITIAL_STATE :Map<*, *> = fromJS({
  [GET_EDM_TYPES]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_ENTITY_SETS_WITH_METADATA]: { [REQUEST_STATE]: RequestStates.STANDBY },
  [GET_ENTITY_SET]: { [REQUEST_STATE]: RequestStates.STANDBY },
  entitySets: List(),
  entitySetsIndexMap: Map(),
  entitySetsMetaData: Map(),
  entityTypes: List(),
  entityTypesIndexMap: Map(),
  propertyTypes: List(),
  propertyTypesIndexMap: Map(),
});

export default function reducer(state :Map<*, *> = INITIAL_STATE, action :Object) {

  switch (action.type) {

    case getEntityDataModelTypes.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntityDataModelTypes.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_EDM_TYPES, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_EDM_TYPES, seqAction.id], seqAction),
        SUCCESS: () => {

          const rawEntityTypes :EntityTypeObject[] = seqAction.value.entityTypes;
          const entityTypes :List = List().asMutable();
          const entityTypesIndexMap :Map = Map().asMutable();

          rawEntityTypes.forEach((et :EntityTypeObject, index :number) => {
            try {
              const entityType = (new EntityTypeBuilder(et)).build();
              entityTypes.push(entityType);
              entityTypesIndexMap.set(entityType.id, index);
              entityTypesIndexMap.set(entityType.type, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, et);
            }
          });

          const rawPropertyTypes :PropertyTypeObject[] = seqAction.value.propertyTypes;
          const propertyTypes :List = List().asMutable();
          const propertyTypesIndexMap :Map = Map().asMutable();

          rawPropertyTypes.forEach((pt :PropertyTypeObject, index :number) => {
            try {
              const propertyType = (new PropertyTypeBuilder(pt)).build();
              propertyTypes.push(propertyType);
              propertyTypesIndexMap.set(propertyType.id, index);
              propertyTypesIndexMap.set(propertyType.type, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, pt);
            }
          });

          return state
            .set('entityTypes', entityTypes.asImmutable())
            .set('entityTypesIndexMap', entityTypesIndexMap.asImmutable())
            .set('propertyTypes', propertyTypes.asImmutable())
            .set('propertyTypesIndexMap', propertyTypesIndexMap.asImmutable())
            .setIn([GET_EDM_TYPES, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('entityTypes', List())
          .set('entityTypesIndexMap', Map())
          .set('propertyTypes', List())
          .set('propertyTypesIndexMap', Map())
          .setIn([GET_EDM_TYPES, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([GET_EDM_TYPES, seqAction.id]),
      });
    }

    case getEntitySet.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntitySet.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_SET, seqAction.id], seqAction),
        SUCCESS: () => {

          if (state.hasIn([GET_ENTITY_SET, seqAction.id])) {

            const entitySet :EntitySet = (new EntitySetBuilder(seqAction.value)).build();
            let entitySets :List = state.get('entitySets');
            let entitySetsIndexMap :Map = state.get('entitySetsIndexMap');

            if (entitySetsIndexMap.has(entitySet.id)) {
              entitySets = entitySets.update(entitySetsIndexMap.get(entitySet.id), () => entitySet);
            }
            else {
              entitySets = entitySets.push(entitySet);
              const newEntitySetIndex :number = entitySets.count() - 1;
              entitySetsIndexMap = entitySetsIndexMap
                .set(entitySet.id, newEntitySetIndex)
                .set(entitySet.name, newEntitySetIndex);
            }

            return state
              .set('entitySets', entitySets)
              .set('entitySetsIndexMap', entitySetsIndexMap)
              .setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state.setIn([GET_ENTITY_SET, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ENTITY_SET, seqAction.id]),
      });
    }

    case getEntitySets.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntitySets.reducer(state, seqAction, {
        REQUEST: () => state
          .setIn([GET_ENTITY_SETS, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_SETS, seqAction.id], seqAction),
        SUCCESS: () => {

          if (state.hasIn([GET_ENTITY_SETS, seqAction.id])) {

            let entitySets :List = state.get('entitySets');
            let entitySetsIndexMap :Map = state.get('entitySetsIndexMap');

            Object.values(seqAction.value).forEach((es) => {

              const entitySet :EntitySet = (new EntitySetBuilder(es)).build();
              if (entitySetsIndexMap.has(entitySet.id)) {
                entitySets = entitySets.update(entitySetsIndexMap.get(entitySet.id), () => entitySet);
              }
              else {
                entitySets = entitySets.push(entitySet);
                const newEntitySetIndex :number = entitySets.count() - 1;
                entitySetsIndexMap = entitySetsIndexMap
                  .set(entitySet.id, newEntitySetIndex)
                  .set(entitySet.name, newEntitySetIndex);
              }
            });

            return state
              .set('entitySets', entitySets)
              .set('entitySetsIndexMap', entitySetsIndexMap)
              .setIn([GET_ENTITY_SETS, REQUEST_STATE], RequestStates.SUCCESS);
          }

          return state;
        },
        FAILURE: () => state.setIn([GET_ENTITY_SETS, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state.deleteIn([GET_ENTITY_SETS, seqAction.id]),
      });
    }

    case getEntitySetsWithMetaData.case(action.type): {
      const seqAction :SequenceAction = action;
      return getEntitySetsWithMetaData.reducer(state, action, {
        REQUEST: () => state
          .setIn([GET_ENTITY_SETS_WITH_METADATA, REQUEST_STATE], RequestStates.PENDING)
          .setIn([GET_ENTITY_SETS_WITH_METADATA, seqAction.id], seqAction),
        SUCCESS: () => {

          const rawEntitySets :EntitySetObject[] = seqAction.value.entitySets;
          const entitySets :List = List().asMutable();
          const entitySetsIndexMap :Map = Map().asMutable();

          rawEntitySets.forEach((es :EntitySetObject, index :number) => {
            try {
              const entitySet = (new EntitySetBuilder(es)).build();
              entitySets.push(entitySet);
              entitySetsIndexMap.set(entitySet.id, index);
              entitySetsIndexMap.set(entitySet.name, index);
            }
            catch (e) {
              LOG.error(seqAction.type, e);
              LOG.error(seqAction.type, es);
            }
          });

          return state
            .set('entitySets', entitySets.asImmutable())
            .set('entitySetsIndexMap', entitySetsIndexMap.asImmutable())
            .set('entitySetsMetaData', fromJS(seqAction.value.entitySetsMetaData))
            .setIn([GET_ENTITY_SETS_WITH_METADATA, REQUEST_STATE], RequestStates.SUCCESS);
        },
        FAILURE: () => state
          .set('entitySets', List())
          .set('entitySetsIndexMap', Map())
          .set('entitySetsMetaData', Map())
          .setIn([GET_ENTITY_SETS_WITH_METADATA, REQUEST_STATE], RequestStates.FAILURE),
        FINALLY: () => state
          .deleteIn([GET_ENTITY_SETS_WITH_METADATA, seqAction.id]),
      });
    }

    default:
      return state;
  }
}
