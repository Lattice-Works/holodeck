/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Card,
  CardHeader,
  CardSegment,
  Colors,
} from 'lattice-ui-kit';

import { isNonEmptyString } from '../../utils/LangUtils';

const { NEUTRALS } = Colors;

const EntitySetName = styled.h2`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
`;

const EntitySetDetails = styled.p`
  color: ${NEUTRALS[1]};
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  overflow: hidden;
  overflow-wrap: break-word;
  padding: 0;
  text-overflow: ellipsis;

  &:first-child {
    margin-bottom: 10px;
  }
`;

type Props = {
  entitySet :Map<*, *>;
  onClick :(entitySet :Map<*, *>) => void;
  size :?number;
}

export default class EntitySetCard extends React.Component<Props> {

  goToEntitySet = () => {}

  render() {

    const { entitySet, size, onClick } = this.props;

    // TODO: refactor as a utility function
    let description :string = entitySet.get('description', '');
    if (description.length > 100) {
      let spaceIndex = description.indexOf(' ', 98);
      if (spaceIndex === -1) spaceIndex = 100;
      description = `${description.substr(0, spaceIndex)}...`;
    }

    let entitySetSize = '';
    if (typeof size === 'number') {
      entitySetSize = `${size.toLocaleString()} ${size === 1 ? 'entity' : 'entities'}`;
    }

    return (
      <Card key={entitySet.get('id')} onClick={onClick}>
        <CardHeader padding="md">
          <EntitySetName>{entitySet.get('title', '')}</EntitySetName>
        </CardHeader>
        <CardSegment vertical>
          {
            isNonEmptyString(entitySetSize) && (
              <EntitySetDetails>{entitySetSize}</EntitySetDetails>
            )
          }
          {
            isNonEmptyString(description) && (
              <EntitySetDetails>{description}</EntitySetDetails>
            )
          }
        </CardSegment>
      </Card>
    );
  }
}
