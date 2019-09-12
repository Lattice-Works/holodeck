/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DataApi } from 'lattice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';
import { faCloudDownload } from '@fortawesome/pro-light-svg-icons';

import BackNavButton from '../buttons/BackNavButton';
import InfoButton from '../buttons/InfoButton';
import Banner from '../cards/Banner';
import StyledInput from '../controls/StyledInput';
import { SecondaryLink } from '../buttons/SecondaryButton';
import { FixedWidthWrapper, HeaderComponentWrapper } from '../layout/Layout';

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
  width: ${(props) => (props.fullSize ? '100%' : '19%')};
`;

const InputLabel = styled.span`
  color: #8e929b;
  margin-bottom: 10px;
  font-size: 14px;
`;

const StyledBanner = styled(Banner)`
  color: #ffffff !important;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DownloadButton = styled(SecondaryLink)`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    margin-left: 7px;
  }
`;

type Props = {
  deselectEntitySet :() => void;
  executeSearch :(startVal :?number) => void;
  onChange :() => void;
  searchTerm :string;
  selectedEntitySet :?Map<*, *>;
  selectedEntitySetSize :?number;
};

const SearchParameterSelection = ({
  selectedEntitySet,
  selectedEntitySetSize,
  deselectEntitySet,
  searchTerm,
  executeSearch,
  onChange
} :Props) => {

  const entitySetTitle = selectedEntitySet ? selectedEntitySet.get('title') : '';

  const onKeyPress = (e) => {
    const { key } = e;
    if (key === 'Enter') {
      executeSearch(0);
    }
  };

  const entitySetId :UUID = selectedEntitySet ? selectedEntitySet.get('id', '') : '';
  const downloadUrl = DataApi.getEntitySetDataFileUrl(entitySetId, 'csv');

  return (
    <CenteredHeaderWrapper>
      <FixedWidthWrapper>
        <Row>
          <BackNavButton onClick={deselectEntitySet}>Back to dataset selection</BackNavButton>
          <DownloadButton href={downloadUrl}>
            <FontAwesomeIcon icon={faCloudDownload} />
            <span>Download</span>
          </DownloadButton>
        </Row>
        <Title>
          <div>Search</div>
          <span><FontAwesomeIcon icon={faDatabase} /></span>
          <span>{entitySetTitle}</span>
          {
            typeof selectedEntitySetSize === 'number' && (
              <StyledBanner>
                {`${selectedEntitySetSize.toLocaleString()} ${selectedEntitySetSize === 1 ? 'entity' : 'entities'}`}
              </StyledBanner>
            )
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
