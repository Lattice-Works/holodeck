/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Constants, Models } from 'lattice';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  Colors,
  PaginationToolbar,
  SearchButton,
  SearchInput,
  Spinner,
  Table,
} from 'lattice-ui-kit';
import { LangUtils, useInput, useRequestState } from 'lattice-utils';
import { rgba } from 'polished';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { ErrorCardSegment } from '../../../components';
import { EDMUtils } from '../../../core/edm';
import {
  HITS,
  PAGE,
  QUERY,
  REDUCERS,
  TOTAL_HITS,
} from '../../../core/redux/constants';
import { SearchActions } from '../../../core/search';
import { MAX_HITS_10 } from '../../../core/search/constants';

const { OPENLATTICE_ID_FQN } = Constants;
const { NEUTRALS } = Colors;
const { EntitySet, PropertyType } = Models;
const { SEARCH } = REDUCERS;
const { SEARCH_ENTITY_SET, searchEntitySet } = SearchActions;
const { isNonEmptyString } = LangUtils;
const { useEntityTypePropertyTypes } = EDMUtils;

const SearchContentWrapper = styled(AppContentWrapper)`
  flex: 1;

  > div {
    flex: 0 1 auto;
    max-width: none;
    width: auto;
  }
`;

const SearchCard = styled(Card)`
  flex: 1;
`;

const SearchGrid = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  grid-gap: 10px;
  grid-template-columns: 1fr auto;

  button {
    line-height: 1.5;
  }
`;

const PagingWrapper = styled.section`
  padding: 2px;
`;


// TODO: this is hacky, we can do better
const TableCardSegment = styled(CardSegment)`
  padding-top: 0;

  > div {
    border: 1px solid ${NEUTRALS[4]};
    border-radius: 3px;
    overflow: scroll;
  }

  table {
    margin-bottom: -1px;
    overflow: scroll;
    width: auto;
  }

  td,
  th {
    max-width: 500px;
    min-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const SpinnerWrapper = styled.div`
  background-color: ${rgba('white', 0.8)};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  opacity: 0.9;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

type Props = {
  entitySet :EntitySet;
};

const EntitySetSearchContainer = ({ entitySet } :Props) => {

  const dispatch = useDispatch();
  const searchRS :?RequestState = useRequestState([SEARCH, SEARCH_ENTITY_SET]);
  const searchPage :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SET, PAGE], 0));
  const searchQuery :string = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SET, QUERY], ''));
  const searchResults :List = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SET, HITS], List()));
  const totalHits :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SET, TOTAL_HITS], 0));

  const [query, setQuery] = useInput(searchQuery);
  const propertyTypes :PropertyType[] = useEntityTypePropertyTypes(entitySet.entityTypeId);

  // OPTIMIZE: no need to compute this on every render
  const tableHeaders = propertyTypes.map((propertyType) => ({
    key: propertyType.type.toString(),
    label: propertyType.title,
    sortable: false,
  }));

  // OPTIMIZE: no need to compute this on every render
  const tableData = searchResults
    .map((entity :Map) => entity.set('id', entity.getIn([OPENLATTICE_ID_FQN, 0])))
    .toJS();

  const dispatchSearch = (params ?:{ page :number, start :number } = {}) => {
    if (isNonEmptyString(query)) {
      const { page = 0, start = 0 } = params;
      dispatch(
        searchEntitySet({
          page,
          query,
          start,
          entitySetId: entitySet.id,
        })
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
    <SearchContentWrapper>
      <SearchCard>
        <AppContentWrapper>
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
        {
          searchRS === RequestStates.FAILURE && (
            <ErrorCardSegment borderless>
              <span>Sorry, something went wrong with this search. Please try again.</span>
            </ErrorCardSegment>
          )
        }
        {
          searchRS === RequestStates.PENDING && (
            <SpinnerWrapper>
              <Spinner size="2x" />
            </SpinnerWrapper>
          )
        }
        <TableCardSegment vertical>
          <PagingWrapper>
            <PaginationToolbar
                page={searchPage}
                count={totalHits}
                onPageChange={handleOnPageChange}
                rowsPerPage={MAX_HITS_10} />
          </PagingWrapper>
          <Table
              data={tableData}
              headers={tableHeaders} />
          <PagingWrapper>
            <PaginationToolbar
                page={searchPage}
                count={totalHits}
                onPageChange={handleOnPageChange}
                rowsPerPage={MAX_HITS_10} />
          </PagingWrapper>
        </TableCardSegment>
      </SearchCard>
    </SearchContentWrapper>
  );
};

export default EntitySetSearchContainer;
