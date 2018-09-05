/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import PersonResultCard from '../people/PersonResultCard';
import { getEntityKeyId } from '../../utils/DataUtils';

type Props = {
  results :List<*>,
  isPersonType :boolean,
  entitySetId :string,
  onSelectEntity :({ entitySetId :string, entityKeyId :string}) => void
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default class TopUtilizerResults extends React.Component<Props> {

  renderPersonResults = () => {
    const { entitySetId, onSelectEntity, results } = this.props;

    return results.map((person, index) => {
      const entityKeyId = getEntityKeyId(person);
      return (
        <PersonResultCard
            key={entityKeyId}
            index={index + 1}
            person={person}
            onClick={() => onSelectEntity({ entitySetId, entityKeyId })} />
      );
    });
  }

  render() {
    const { isPersonType } = this.props;
    let resultContent = <div>Results.</div>
    if (isPersonType) {
      resultContent = this.renderPersonResults();
    }
    return (
      <ResultsContainer>
        {resultContent}
      </ResultsContainer>
    );
  }
}
