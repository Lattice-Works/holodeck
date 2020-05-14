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
  CardSegment,
  CardStack,
  Colors,
  PaginationToolbar,
  SearchButton,
  SearchInput,
  Spinner,
} from 'lattice-ui-kit';
import { LangUtils, useInput, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { EntitySetSearchResultCard } from '../../components';
import {
  HITS,
  REDUCERS,
  TOTAL_HITS,
} from '../../core/redux/constants';
import { SearchActions } from '../../core/search';
import { MAX_HITS } from '../../core/search/constants';

const { NEUTRALS, WHITE } = Colors;
const { SEARCH } = REDUCERS;
const { SEARCH_ENTITY_SETS, searchEntitySets } = SearchActions;
const { isNonEmptyString } = LangUtils;

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

const ExploreContainer = () => {

  const dispatch = useDispatch();
  const [query, setQuery] = useInput('');
  const [page, setPage] = useState(0);

  const searchRS :?RequestState = useRequestState([SEARCH, SEARCH_ENTITY_SETS]);
  const searchResults :List = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, HITS], List()));
  const totalHits :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, TOTAL_HITS], 0));

  const dispatchSearch = (start = 0) => {
    if (isNonEmptyString(query)) {
      dispatch(
        searchEntitySets({ query, start })
      );
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
      <AppContentWrapper bgColor={WHITE}>
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
      </AppContentWrapper>
      <AppContentWrapper>
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
                  searchResults.map((searchResult :Map) => (
                    <EntitySetSearchResultCard
                        key={searchResult.getIn(['entitySet', 'id'])}
                        searchResult={searchResult} />
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
