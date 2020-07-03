/*
 * @flow
 */

import React, { useState } from 'react';

import _includes from 'lodash/includes';
import styled from 'styled-components';
import { List } from 'immutable';
import { Models, Types } from 'lattice';
import {
  AppContentWrapper,
  CardStack,
  Checkbox,
  Collapse,
  Label,
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
  ChevronButton,
  NoSearchResultsCardSegment,
  SimpleEntitySetCard,
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
import { OrgSelect } from '../orgs';

const { EntitySet } = Models;
const { EntitySetFlagTypes } = Types;
const { SEARCH } = REDUCERS;
const { SEARCH_ENTITY_SETS, searchEntitySets } = SearchActions;
const { isNonEmptyString } = LangUtils;

const SearchSection = styled.section`
  padding: 70px 0;
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

const SearchResultCardStack = styled(CardStack)`
  margin: 30px 0;
`;

const SearchOptionsControl = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  justify-content: space-between;
  margin-top: 20px;

  &:hover {
    cursor: pointer;
  }
`;

const SearchOptionsGrid = styled.div`
  align-items: end;
  display: grid;
  grid-gap: 20px 30px;
  grid-template-columns: repeat(auto-fill, minmax(300px, auto));
  margin-top: 10px;
`;

const ExploreContainer = () => {

  const dispatch = useDispatch();
  const searchPage :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, PAGE], 0));
  const searchQuery :string = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, QUERY], ''));
  const searchRS :?RequestState = useRequestState([SEARCH, SEARCH_ENTITY_SETS]);
  const entitySets :List<EntitySet> = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, HITS], List()));
  const totalHits :number = useSelector((s) => s.getIn([SEARCH, SEARCH_ENTITY_SETS, TOTAL_HITS], 0));

  const [query, setQuery] = useInput(searchQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckedShowAudit, setIsCheckedShowAudit] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState();

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

  const toggleSearchOptions = () => setIsOpen(!isOpen);
  const toggleShowAudit = () => setIsCheckedShowAudit(!isCheckedShowAudit);

  return (
    <>
      <AppContentWrapper bgColor="white">
        <SearchSection>
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
          <div>
            <SearchOptionsControl onClick={toggleSearchOptions}>
              <span>Filter Search Results</span>
              <ChevronButton isOpen={isOpen} onClick={toggleSearchOptions} size="sm" />
            </SearchOptionsControl>
            <Collapse in={isOpen}>
              <SearchOptionsGrid>
                <div>
                  <Label htmlFor="orgs">By Organization</Label>
                  <OrgSelect onChange={(orgId) => setSelectedOrgId(orgId)} />
                </div>
                <div>
                  <Checkbox
                      checked={isCheckedShowAudit}
                      label="Show audit entity sets"
                      onChange={toggleShowAudit} />
                </div>
              </SearchOptionsGrid>
            </Collapse>
          </div>
        </SearchSection>
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
          searchRS === RequestStates.SUCCESS && entitySets.isEmpty() && (
            <NoSearchResultsCardSegment />
          )
        }
        {
          searchRS === RequestStates.SUCCESS && !entitySets.isEmpty() && (
            <>
              <PaginationToolbar
                  page={searchPage}
                  count={totalHits}
                  onPageChange={handleOnPageChange}
                  rowsPerPage={MAX_HITS_20} />
              <SearchResultCardStack>
                {
                  entitySets
                    .filter((entitySet :EntitySet) => (
                      isCheckedShowAudit || !_includes(entitySet.flags, EntitySetFlagTypes.AUDIT)
                    ))
                    .filter((entitySet :EntitySet) => (
                      !selectedOrgId || entitySet.organizationId === selectedOrgId
                    ))
                    .map((entitySet :EntitySet) => (
                      <SimpleEntitySetCard key={entitySet.id} entitySet={entitySet} />
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
