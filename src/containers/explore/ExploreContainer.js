/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  AppContentWrapper,
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

import {
  BasicErrorComponent,
  EntitySetSearchResultCard,
  NoSearchResultsCardSegment,
} from '../../components';
import {
  HITS,
  PAGE,
  QUERY,
  REDUCERS,
  TOTAL_HITS,
} from '../../core/redux/constants';
import { SearchActions } from '../../core/search';
import { MAX_HITS_20 } from '../../core/search/constants';

const { WHITE } = Colors;
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

const ExploreContainer = () => {

  const dispatch = useDispatch();
  const searchPage :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, PAGE], 0));
  const searchQuery :string = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, QUERY], ''));
  const searchRS :?RequestState = useRequestState([SEARCH, SEARCH_ENTITY_SETS]);
  const searchResults :List = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, HITS], List()));
  const totalHits :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, TOTAL_HITS], 0));

  const [query, setQuery] = useInput(searchQuery);

  const dispatchSearch = (params ?:{ page :number, start :number } = {}) => {
    if (isNonEmptyString(query)) {
      const { page = 0, start = 0 } = params;
      dispatch(
        searchEntitySets({ page, query, start })
      );
    }
  };

  const handleOnClickSearch = (event :SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatchSearch();
  };

  const handleOnPageChange = ({ page, start }) => {
    dispatchSearch({ page, start });
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
            <BasicErrorComponent>
              Sorry, something went wrong with this search. Please try again.
            </BasicErrorComponent>
          )
        }
        {
          searchRS === RequestStates.SUCCESS && searchResults.isEmpty() && (
            <NoSearchResultsCardSegment />
          )
        }
        {
          searchRS === RequestStates.SUCCESS && !searchResults.isEmpty() && (
            <>
              <PaginationToolbar
                  page={searchPage}
                  count={totalHits}
                  onPageChange={handleOnPageChange}
                  rowsPerPage={MAX_HITS_20} />
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
                  page={searchPage}
                  count={totalHits}
                  onPageChange={handleOnPageChange}
                  rowsPerPage={MAX_HITS_20} />
            </>
          )
        }
      </AppContentWrapper>
    </>
  );
};

export default ExploreContainer;
