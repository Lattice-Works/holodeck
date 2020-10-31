/*
 * @flow
 */

import React, { useEffect } from 'react';

import { faLandmark } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, getIn } from 'immutable';
import { Models } from 'lattice';
import { DataSetsApiActions } from 'lattice-sagas';
import { AppContentWrapper, PaginationToolbar, Typography } from 'lattice-ui-kit';
import { LangUtils, ReduxUtils, useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { EntitySet, UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import SearchDataSetsForm from './SearchDataSetsForm';

import {
  DataSetSearchResultCard,
  Spinner,
  StackGrid,
} from '../../components';
import { EDM, SEARCH } from '../../core/redux/constants';
import {
  selectAtlasDataSets,
  selectSearchHits,
  selectSearchPage,
  selectSearchQuery,
  selectSearchTotalHits,
} from '../../core/redux/selectors';
import {
  SEARCH_ORG_DATA_SETS,
  clearSearchState,
  searchOrgDataSets,
} from '../../core/search/SearchActions';

const { Organization } = Models;
const { isNonEmptyString } = LangUtils;
const { selectEntitySets } = ReduxUtils;
const { GET_ORGANIZATION_DATA_SETS, getOrganizationDataSets } = DataSetsApiActions;

const MAX_PER_PAGE = 10;
const SR_DS_META_ESID = '091695e1-a971-40ee-9956-a6a05c5942dd';
// const SR_COL_META_ESID = '37266e3e-8414-49c8-8e20-95b04a28739b';
// const SR_ORG_META_ESID = '1a6bf250-e98b-403a-9046-805a4d1fe80d';

const OrgContainer = ({
  organization,
  organizationId,
} :{
  organization :Organization;
  organizationId :UUID;
}) => {

  const dispatch = useDispatch();

  const getAtlasDataSetsRS :?RequestState = useRequestState([EDM, GET_ORGANIZATION_DATA_SETS]);
  const searchOrgDataSetsRS :?RequestState = useRequestState([SEARCH, SEARCH_ORG_DATA_SETS]);

  const searchPage :number = useSelector(selectSearchPage(SEARCH_ORG_DATA_SETS));
  const searchQuery :string = useSelector(selectSearchQuery(SEARCH_ORG_DATA_SETS));
  const searchTotalHits :number = useSelector(selectSearchTotalHits(SEARCH_ORG_DATA_SETS));
  const atlasDataSetIds :Set<UUID> = useSelector((s) => s.getIn([SEARCH, SEARCH_ORG_DATA_SETS, 'atlasDataSetIds']));
  const entitySetIds :Set<UUID> = useSelector((s) => s.getIn([SEARCH, SEARCH_ORG_DATA_SETS, 'entitySetIds']));

  const atlasDataSets :Map<UUID, Map> = useSelector(selectAtlasDataSets(atlasDataSetIds));
  const entitySets :Map<UUID, EntitySet> = useSelector(selectEntitySets(entitySetIds));
  const pageDataSets :Map<UUID, EntitySet | Map> = Map().merge(atlasDataSets).merge(entitySets);

  useEffect(() => {
    dispatch(getOrganizationDataSets({ organizationId }));
  }, [dispatch, organizationId]);

  const dispatchDataSetSearch = (params :{ page ?:number, query ?:string, start ?:number } = {}) => {
    const { page = 0, query = searchQuery, start = 0 } = params;
    if (isNonEmptyString(query)) {
      dispatch(
        searchOrgDataSets({
          page,
          query,
          start,
          entitySetId: SR_DS_META_ESID,
        })
      );
    }
    else {
      dispatch(clearSearchState(SEARCH_ORG_DATA_SETS));
    }
  };

  if (getAtlasDataSetsRS === RequestStates.PENDING || getAtlasDataSetsRS === RequestStates.STANDBY) {
    return (
      <AppContentWrapper bgColor="white" borderless>
        <Spinner />
      </AppContentWrapper>
    );
  }

  return (
    <>
      <AppContentWrapper bgColor="white" borderless>
        <StackGrid>
          <Typography variant="h1">
            <FontAwesomeIcon fixedWidth icon={faLandmark} size="sm" style={{ marginRight: '20px' }} />
            <span>{organization.title}</span>
          </Typography>
          {
            isNonEmptyString(organization.description) && (
              <Typography>{organization.description}</Typography>
            )
          }
        </StackGrid>
      </AppContentWrapper>
      <AppContentWrapper bgColor="white" borderless>
        <StackGrid gap={16}>
          <SearchDataSetsForm
              onSubmit={(query :string) => dispatchDataSetSearch({ query })}
              searchRequestState={searchOrgDataSetsRS} />
          {
            <PaginationToolbar
                count={searchTotalHits}
                onPageChange={({ page, start }) => dispatchDataSetSearch({ page, start })}
                page={searchPage}
                rowsPerPage={MAX_PER_PAGE} />
          }
          {
            searchOrgDataSetsRS === RequestStates.PENDING && (
              <Spinner />
            )
          }
          {
            searchOrgDataSetsRS === RequestStates.SUCCESS && (
              pageDataSets.valueSeq().map((dataSet :EntitySet | Map) => {
                const id :UUID = dataSet.id || getIn(dataSet, ['table', 'id']);
                return (
                  <DataSetSearchResultCard key={id} dataSet={dataSet} organizationId={organizationId} />
                );
              })
            )
          }
        </StackGrid>
      </AppContentWrapper>
    </>
  );
};

export default OrgContainer;
