/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import PersonResultCard from '../people/PersonResultCard';
import ButtonToolbar from '../buttons/ButtonToolbar';
import { FixedWidthWrapper } from '../layout/Layout';
import { getEntityKeyId } from '../../utils/DataUtils';

type Props = {
  results :List<*>,
  isPersonType :boolean,
  entitySetId :string,
  onSelectEntity :({ entitySetId :string, entityKeyId :string}) => void,
  onUnmount :() => void
}

type State = {
  layout :string
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LeftJustifyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const LAYOUTS = {
  PERSON: 'PERSON',
  TABLE: 'TABLE'
};

export default class TopUtilizerResults extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      layout: props.isPersonType ? LAYOUTS.PERSON : LAYOUTS.TABLE
    };
  }

  componentWillUnmount() {
    const { onUnmount } = this.props;
    onUnmount();
  }

  updateLayout = layout => this.setState({ layout });

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

  renderLayoutToolbar = () => {
    const { layout } = this.state;
    const options = [
      {
        label: 'List',
        value: LAYOUTS.PERSON,
        onClick: () => this.updateLayout(LAYOUTS.PERSON)
      },
      {
        label: 'Table',
        value: LAYOUTS.TABLE,
        onClick: () => this.updateLayout(LAYOUTS.TABLE)
      }
    ]
    return (
      <LeftJustifyWrapper>
        <ButtonToolbar options={options} value={layout} />
      </LeftJustifyWrapper>
    );
  }

  render() {
    const { isPersonType } = this.props;
    let resultContent = <div>Results.</div>
    if (isPersonType) {
      resultContent = this.renderPersonResults();
    }
    return (
      <ResultsContainer>
        <FixedWidthWrapper>
          {isPersonType ? this.renderLayoutToolbar() : null}
          {resultContent}
        </FixedWidthWrapper>
      </ResultsContainer>
    );
  }
}
