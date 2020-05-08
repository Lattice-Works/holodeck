/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faEmptySet } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  CardStack,
  Colors,
  PaginationToolbar,
  SearchButton,
  SearchInput,
  Sizes,
  Spinner,
} from 'lattice-ui-kit';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import useInput from './useInput';

import {
  HITS,
  REDUCERS,
  REQUEST_STATE,
  TOTAL_HITS,
} from '../../core/redux/constants';
import { SEARCH_ENTITY_SETS, searchEntitySets } from '../../core/search/SearchActions';
import { MAX_HITS } from '../../core/search/constants';
import { LangUtils } from '../../utils';

const { NEUTRALS, WHITE } = Colors;
const { APP_CONTENT_WIDTH } = Sizes;
const { SEARCH } = REDUCERS;

const SearchContentWrapper = styled(AppContentWrapper)`
  background-color: ${WHITE};
  border-bottom: 1px solid ${NEUTRALS[5]};
`;

const SearchGrid = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  grid-gap: 10px;
  grid-template-columns: 1fr auto;
  margin: 70px 0;

  button {
    line-height: 1.5;
  }
`;

const SearchResultCardStack = styled(CardStack)`
  margin: 30px 0;
`;

const CenterCardSegment = styled(CardSegment)`
  align-items: center;
  justify-content: center;

  > span {
    margin: 10px 0;
  }

  > span:last-of-type {
    margin: 0;
  }
`;

const NoSearchResults = styled.span`
  color: ${NEUTRALS[1]};
`;

const EntitySetTitle = styled.span`
  font-size: 18px;
  font-weight: normal;
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

const EntitySetDescription = styled.span`
  color: ${NEUTRALS[1]};
  font-size: 12px;
  font-weight: normal;
  margin-top: 8px;
`;

const ExploreContainer = () => {

  const dispatch = useDispatch();
  const [query, setQuery] = useInput('');
  const [page, setPage] = useState(0);

  const searchRS :RequestState = useSelector((store) => store.getIn([SEARCH, SEARCH_ENTITY_SETS, REQUEST_STATE]));
  const searchResults :List = useSelector((store) => store.getIn([SEARCH, SEARCH_ENTITY_SETS, HITS], List()));
  const totalHits :number = useSelector((store) => store.getIn([SEARCH, SEARCH_ENTITY_SETS, TOTAL_HITS], 0));

  const dispatchSearch = (start = 0) => {
    if (LangUtils.isNonEmptyString(query)) {
      dispatch(searchEntitySets({ query, start }));
    }
  };

  const handleOnClickSearch = (event :SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatchSearch();
    setPage(0);
  };

  const handleOnPageChange = ({ page: newPage, start }) => {
    dispatchSearch(start);
    setPage(newPage);
  };

  return (
    <>
      <SearchContentWrapper contentWidth={APP_CONTENT_WIDTH}>
        <form>
          <SearchGrid>
            <SearchInput onChange={setQuery} value={query} />
            <SearchButton
                isLoading={searchRS === RequestStates.PENDING}
                mode="primary"
                onClick={handleOnClickSearch}
                type="submit" />
          </SearchGrid>
        </form>
      </SearchContentWrapper>
      <AppContentWrapper contentWidth={APP_CONTENT_WIDTH}>
        {
          searchRS === RequestStates.PENDING && (
            <Spinner size="2x" />
          )
        }
        {
          searchRS === RequestStates.FAILURE && (
            <CenterCardSegment>
              <span>Sorry, something went wrong with this search. Please try again.</span>
            </CenterCardSegment>
          )
        }
        {
          searchRS === RequestStates.SUCCESS && searchResults.isEmpty() && (
            <CenterCardSegment vertical>
              <FontAwesomeIcon icon={faEmptySet} size="3x" />
              <NoSearchResults>No search results.</NoSearchResults>
              <span>Make sure you are a member of an organization and have permissions.</span>
            </CenterCardSegment>
          )
        }
        {
          searchRS === RequestStates.SUCCESS && !searchResults.isEmpty() && (
            <>
              <PaginationToolbar
                  page={page}
                  count={totalHits}
                  onPageChange={handleOnPageChange}
                  rowsPerPage={MAX_HITS} />
              <SearchResultCardStack>
                {
                  searchResults.map((result :Map) => (
                    <Card
                        id={result.getIn(['entitySet', 'id'])}
                        key={result.getIn(['entitySet', 'id'])}
                        onClick={() => {}}>
                      <CardSegment vertical>
                        <EntitySetTitle>
                          {result.getIn(['entitySet', 'title'])}
                        </EntitySetTitle>
                        <EntitySetDescription>
                          {result.getIn(['entitySet', 'description'])}
                        </EntitySetDescription>
                      </CardSegment>
                    </Card>
                  ))
                }
              </SearchResultCardStack>
              <PaginationToolbar
                  page={page}
                  count={totalHits}
                  onPageChange={handleOnPageChange}
                  rowsPerPage={MAX_HITS} />
            </>
          )
        }
      </AppContentWrapper>
    </>
  );
};

export default ExploreContainer;
