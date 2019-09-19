/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { DataApi } from 'lattice';
import {
  Button,
  IconButton,
  SearchInput,
} from 'lattice-ui-kit';
import { faCloudDownload } from '@fortawesome/pro-light-svg-icons';
import { faChevronLeft } from '@fortawesome/pro-regular-svg-icons';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Banner from '../cards/Banner';

const BackIcon = (
  <FontAwesomeIcon icon={faChevronLeft} />
);

const DownloadIcon = (
  <FontAwesomeIcon icon={faCloudDownload} />
);

const Wrapper = styled.div`
  > div {
    margin: 0 0 30px 0;
  }

  > div:first-child {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }

  > div:last-child {
    margin: 0;
  }
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

const StyledBanner = styled(Banner)`
  color: #ffffff !important;
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
    <Wrapper>
      <div>
        <IconButton icon={BackIcon} mode="subtle" onClick={deselectEntitySet}>Back to dataset selection</IconButton>
        <IconButton href={downloadUrl} icon={DownloadIcon} mode="secondary">Download</IconButton>
      </div>
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
      <SearchInput id="search-entity-set" value={searchTerm} onChange={onChange} onKeyPress={onKeyPress} />
      <Button mode="primary" onClick={executeSearch}>Search</Button>
    </Wrapper>
  );
};

export default SearchParameterSelection;
