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
  isPersonType :boolean
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export default class TopUtilizerResults extends React.Component<Props> {

  renderPersonResults = () => {
    const { results } = this.props;

    return results.map((person, index) => {
      const id = getEntityKeyId(person);
      return (
        <PersonResultCard
            key={id}
            index={index + 1}
            person={person}
            onClick={() => console.log(id)} />
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
