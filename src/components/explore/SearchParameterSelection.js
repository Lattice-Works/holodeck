/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

import BackNavButton from '../buttons/BackNavButton';
import InfoButton from '../buttons/InfoButton';
import Banner from '../cards/Banner';
import StyledInput from '../controls/StyledInput';
import { FixedWidthWrapper, HeaderComponentWrapper } from '../layout/Layout';

type Props = {
  selectedEntitySet :?Map<*, *>,
  selectedEntitySize :?number,
  searchTerm :string,
  deselectEntitySet :() => void,
  executeSearch :() => void,
  onChange :(e) => void
};

const CenteredHeaderWrapper = styled(HeaderComponentWrapper)`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 15px 0 40px 0;

  span {
    margin-left: 10px;
    color: #b6bbc7;

    &:first-child {
      margin-left: 20px;
    }
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  width: ${props => (props.fullSize ? '100%' : '19%')};
`;

const InputLabel = styled.span`
  color: #8e929b;
  margin-bottom: 10px;
  font-size: 14px;
`;

const StyledBanner = styled(Banner)`
  color: #ffffff !important;
`;

const SearchParameterSelection = ({
  selectedEntitySet,
  selectedEntitySetSize,
  deselectEntitySet,
  searchTerm,
  executeSearch,
  onChange
} :Props) => {
  const entitySetTitle = selectedEntitySet.get('title');

  const onKeyPress = (e) => {
    const { key } = e;
    if (key === 'Enter') {
      executeSearch(0);
    }
  };

  return (
    <CenteredHeaderWrapper>
      <FixedWidthWrapper>
        <BackNavButton onClick={deselectEntitySet}>Back to dataset selection</BackNavButton>
        <Title>
          <div>Search</div>
          <span><FontAwesomeIcon icon={faDatabase} /></span>
          <span>{entitySetTitle}</span>
          {selectedEntitySetSize === undefined
            ? null
            : (
              <StyledBanner>
                {`${selectedEntitySetSize.toLocaleString()} ${selectedEntitySetSize === 1 ? 'entity' : 'entities'}`}
              </StyledBanner>)
          }
        </Title>
        <InputRow>
          <InputGroup fullSize>
            <InputLabel>Search Parameter</InputLabel>
            <StyledInput value={searchTerm} onChange={onChange} onKeyPress={onKeyPress} />
          </InputGroup>
        </InputRow>
        <InputRow>
          <InputGroup>
            <InfoButton onClick={executeSearch} fullSize>Search</InfoButton>
          </InputGroup>
        </InputRow>
      </FixedWidthWrapper>
    </CenteredHeaderWrapper>
  );
};

export default SearchParameterSelection;
