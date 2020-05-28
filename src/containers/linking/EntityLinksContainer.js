/*
 * @flow
 */

import React, { useEffect } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DataApiActions } from 'lattice-sagas';
import { Card, Spinner } from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { EntityLinkingCard } from './components';

const { GET_LINKED_ENTITY_SET_BREAKDOWN, getLinkedEntitySetBreakdown } = DataApiActions;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));

  ${Card} {
    min-width: 0; /* setting min-width ensures cards do not overflow the grid column */
  }
`;

type Props = {|
  entityKeyId :UUID;
  entitySetId :UUID;
|};

type StateProps = {
  entitySets :List;
  entitySetsIndexMap :Map;
  links :Map;
  requestStates :{
    GET_LINKED_ENTITY_SET_BREAKDOWN :RequestState;
  };
};
const EntityLinksContainer = (props :Props) => {

  const { entityKeyId, entitySetId } = props;
  const dispatch = useDispatch();

  const {
    entitySets,
    entitySetsIndexMap,
    links,
    requestStates,
  } :StateProps = useSelector((state :Map) => ({
    entitySets: state.getIn(['edm', 'entitySets'], List()),
    entitySetsIndexMap: state.getIn(['edm', 'entitySetsIndexMap'], Map()),
    links: state.getIn(['linking', 'links', entityKeyId], Map()),
    requestStates: {
      [GET_LINKED_ENTITY_SET_BREAKDOWN]: state.getIn(['linking', GET_LINKED_ENTITY_SET_BREAKDOWN, 'requestState']),
    },
  }));

  useEffect(() => {
    dispatch(
      getLinkedEntitySetBreakdown({ entitySetId, entityKeyIds: [entityKeyId] })
    );
  }, [dispatch, entityKeyId, entitySetId]);

  if (requestStates[GET_LINKED_ENTITY_SET_BREAKDOWN] === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

  const cards = [];
  links.forEach((linkedEntities :Map, linkedEntitySetId :UUID) => {
    linkedEntities.forEach((linkedEntity :Map, linkedEntityKeyId :UUID) => {
      const entitySetIndex :number = entitySetsIndexMap.get(linkedEntitySetId);
      const entitySetTitle :string = entitySets.get(entitySetIndex, Map()).get('title', '');
      cards.push(
        <EntityLinkingCard
            entity={linkedEntity}
            entitySetTitle={entitySetTitle}
            isLinked
            key={linkedEntityKeyId} /> // eslint-disable-line react/no-array-index-key
      );
    });
  });

  return (
    <CardGrid>
      {cards}
    </CardGrid>
  );
};

export default EntityLinksContainer;
