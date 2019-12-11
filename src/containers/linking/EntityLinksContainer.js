/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { DataApiActions } from 'lattice-sagas';
import { Card, Spinner } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import { EntityLinkingCard } from './components';

const { GET_LINKED_ENTITY_SET_BREAKDOWN } = DataApiActions;

const CardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));

  ${Card} {
    min-width: 0; /* setting min-width ensures cards do not overflow the grid column */
  }
`;

type OwnProps = {|
  entityKeyId :UUID;
  entitySetId :UUID;
|};

type Props = {
  ...OwnProps;
  actions :{
    getLinkedEntitySetBreakdown :RequestSequence;
  };
  entitySets :List;
  entitySetsIndexMap :Map;
  links :Map;
  requestStates :{
    GET_LINKED_ENTITY_SET_BREAKDOWN :RequestState;
  };
};

class EntityLinksContainer extends Component<Props> {

  componentDidMount() {

    const { actions, entityKeyId, entitySetId } = this.props;
    actions.getLinkedEntitySetBreakdown({ entitySetId, entityKeyIds: [entityKeyId] });
  }

  componentDidUpdate(props :Props) {

    const { actions, entityKeyId, entitySetId } = this.props;

    if (props.entityKeyId !== entityKeyId || props.entitySetId !== entitySetId) {
      actions.getLinkedEntitySetBreakdown({ entitySetId, entityKeyIds: [entityKeyId] });
    }
  }

  render() {

    const {
      entitySets,
      entitySetsIndexMap,
      links,
      requestStates,
    } = this.props;

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
  }
}

const mapStateToProps = (state :Map, props :OwnProps) => {

  const { entityKeyId } = props;

  return {
    entitySets: state.getIn(['edm', 'entitySets'], List()),
    entitySetsIndexMap: state.getIn(['edm', 'entitySetsIndexMap'], Map()),
    links: state.getIn(['linking', 'links', entityKeyId], Map()),
    requestStates: {
      [GET_LINKED_ENTITY_SET_BREAKDOWN]: state.getIn(['linking', GET_LINKED_ENTITY_SET_BREAKDOWN, 'requestState']),
    },
  };
};

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    getLinkedEntitySetBreakdown: DataApiActions.getLinkedEntitySetBreakdown,
  }, dispatch)
});

// $FlowFixMe
export default connect(mapStateToProps, mapActionsToProps)(EntityLinksContainer);
