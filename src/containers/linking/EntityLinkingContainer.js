/*
 * @flow
 */

import React, { Component } from 'react';

import styled from 'styled-components';
import { faLink } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import { Constants } from 'lattice';
import {
  AppContentWrapper,
  Card,
  CardSegment,
  Colors,
  IconButton,
  Search,
  Sizes,
  Spinner,
} from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RequestStates } from 'redux-reqseq';
import type { Location } from 'react-router';
import type { RequestSequence, RequestState } from 'redux-reqseq';

import * as LinkingActions from './LinkingActions';
import { LinkedEntityCard } from './components';
import { PersonPicture } from '../../components';
import { FullyQualifiedNames } from '../../core/edm/constants';

const { NEUTRALS } = Colors;
const { OPENLATTICE_ID_FQN } = Constants;

const {
  SEARCH_LINKED_ENTITY_SETS,
} = LinkingActions;

const {
  OL_DATA_SOURCE_FQN,
  PERSON_BIRTH_DATE_FQN,
  PERSON_ETHNICITY_FQN,
  PERSON_FIRST_NAME_FQN,
  PERSON_LAST_NAME_FQN,
  PERSON_RACE_FQN,
  PERSON_SEX_FQN,
} = FullyQualifiedNames.PROPERTY_TYPE_FQNS;

const SEARCH_FIELDS = [
  { id: PERSON_FIRST_NAME_FQN, label: 'First Name' },
  { id: PERSON_LAST_NAME_FQN, label: 'Last Name' },
  { id: PERSON_BIRTH_DATE_FQN, label: 'Date of Birth', type: 'date' },
];

const SearchResultCardGrid = styled.div`
  display: grid;
  grid-gap: 30px;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  margin-top: 20px !important;

  ${Card} {
    min-width: 0; /* setting min-width ensures cards do not overflow the grid column */
  }
`;

const ResultDetailsGrid = styled.div`
  display: grid;
  font-size: 14px;
  font-weight: normal;
  grid-column-gap: 30px;
  grid-row-gap: 10px;
  grid-template-columns: 1fr 2fr;

  > h4 {
    color: ${NEUTRALS[1]};
    font-weight: 600;
    margin: 0;
  }
`;

const PictureAndButtonsWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const LinkIcon = (
  <FontAwesomeIcon fixedWidth icon={faLink} transform={{ rotate: 45 }} />
);

type Props = {
  actions :{
    searchLinkedEntitySets :RequestSequence;
  };
  entityKeyId :?UUID;
  entitySetId :?UUID;
  entitySets :List;
  entitySetsIndexMap :Map;
  entityTypes :List;
  entityTypesIndexMap :Map;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
  requestStates :{
    SEARCH_LINKED_ENTITY_SETS :RequestState;
  };
  searchResults :Map;
};

class EntityLinkingContainer extends Component<Props> {

  handleOnClickLink = () => {}

  handleOnSearchLinked = (values :Map) => {

    const {
      actions,
      entitySetId,
      entitySets,
      entitySetsIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    const propertyTypeIndex1 = propertyTypesIndexMap.get(PERSON_FIRST_NAME_FQN);
    const propertyTypeIndex2 = propertyTypesIndexMap.get(PERSON_LAST_NAME_FQN);
    const propertyTypeIndex3 = propertyTypesIndexMap.get(PERSON_BIRTH_DATE_FQN);
    const propertyTypeId1 :UUID = propertyTypes.get(propertyTypeIndex1, Map()).get('id');
    const propertyTypeId2 :UUID = propertyTypes.get(propertyTypeIndex2, Map()).get('id');
    const propertyTypeId3 :UUID = propertyTypes.get(propertyTypeIndex3, Map()).get('id');

    const searchFieldValues = [
      { propertyTypeId: propertyTypeId1, value: values.get(PERSON_FIRST_NAME_FQN, '') },
      { propertyTypeId: propertyTypeId2, value: values.get(PERSON_LAST_NAME_FQN, '') },
      { propertyTypeId: propertyTypeId3, value: values.get(PERSON_BIRTH_DATE_FQN, '') },
    ];

    const entitySetIndex = entitySetsIndexMap.get(entitySetId);
    const entitySet = entitySets.get(entitySetIndex, Map());
    actions.searchLinkedEntitySets({
      searchFieldValues,
      entitySetIds: entitySet.get('linkedEntitySets', List()),
    });
  }

  renderSearchResults = (searchResultsProps :Object) => {

    if (!searchResultsProps.hasSearched) {
      return null;
    }

    return (
      <SearchResultCardGrid>
        {searchResultsProps.results.map(this.renderSearchResult)}
      </SearchResultCardGrid>
    );
  }

  renderSearchResult = (result :Map) => {

    const { entitySets, entitySetsIndexMap } = this.props;

    const entityKeyId :UUID = result.get(OPENLATTICE_ID_FQN);
    const entitySetId :UUID = result.get('entitySetId', '');
    const entitySetIndex :number = entitySetsIndexMap.get(entitySetId);
    const entitySetTitle :string = entitySets.get(entitySetIndex, Map()).get('title', '');

    return (
      <LinkedEntityCard
          entity={result}
          entitySetTitle={entitySetTitle}
          isLinked={false}
          key={entityKeyId}
          onClickLink={this.handleOnClickLink} />
    );
  }

  render() {

    const { requestStates, searchResults } = this.props;

    const searchResultsProp = List().withMutations((list :List) => {
      searchResults.forEach((results :List, entitySetId :UUID) => (
        results.get('hits', List()).forEach((result :Map) => list.push(result.merge({ entitySetId })))
      ));
    });

    const hasSearched :boolean = requestStates[SEARCH_LINKED_ENTITY_SETS] !== RequestStates.STANDBY;
    const isSearchPending :boolean = requestStates[SEARCH_LINKED_ENTITY_SETS] === RequestStates.PENDING;

    return (
      <AppContentWrapper contentWidth={Sizes.APP_CONTENT_WIDTH}>
        <Search
            hasSearched={hasSearched}
            isLoading={isSearchPending}
            onSearch={this.handleOnSearchLinked}
            searchFields={SEARCH_FIELDS}
            searchResults={searchResultsProp}
            searchResultsComponent={this.renderSearchResults} />
        {
          isSearchPending && (
            <Spinner size="2x" />
          )
        }
      </AppContentWrapper>
    );
  }
}

function mapStateToProps(state :Map, props :Object) :Object {

  const {
    params: {
      entityKeyId = null,
      entitySetId = null,
    } = {},
  } = props.match;

  return {
    entityKeyId,
    entitySetId,
    entitySets: state.getIn(['edm', 'entitySets'], List()),
    entitySetsIndexMap: state.getIn(['edm', 'entitySetsIndexMap'], Map()),
    entityTypes: state.getIn(['edm', 'entityTypes'], List()),
    entityTypesIndexMap: state.getIn(['edm', 'entityTypesIndexMap'], Map()),
    propertyTypes: state.getIn(['edm', 'propertyTypes'], List()),
    propertyTypesIndexMap: state.getIn(['edm', 'propertyTypesIndexMap'], Map()),
    requestStates: {
      [SEARCH_LINKED_ENTITY_SETS]: state.getIn(['linking', SEARCH_LINKED_ENTITY_SETS, 'requestState'])
    },
    searchResults: state.getIn(['linking', 'searchResults'], Map()),
  };
}

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    searchLinkedEntitySets: LinkingActions.searchLinkedEntitySets,
  }, dispatch)
});

export default connect(mapStateToProps, mapActionsToProps)(EntityLinkingContainer);
