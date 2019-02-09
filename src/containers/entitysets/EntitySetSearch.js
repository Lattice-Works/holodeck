/*
 * @flow
 */

import React from 'react';
import { List, Map } from 'immutable';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

import StyledInput from '../../components/controls/StyledInput';
import StyledLink from '../../components/controls/StyledLink';
import StyledCheckbox from '../../components/controls/StyledCheckbox';
import EntitySetCard from '../../components/cards/EntitySetCard';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import Pagination from '../../components/explore/Pagination';
import { EDM, ENTITY_SETS, STATE } from '../../utils/constants/StateConstants';
import { ComponentWrapper, HeaderComponentWrapper } from '../../components/layout/Layout';
import * as Routes from '../../core/router/Routes';
import * as EntitySetActionFactory from './EntitySetActionFactory';
import * as TopUtilizersActionFactory from '../toputilizers/TopUtilizersActionFactory';

type Props = {
  actionText :string,
  path :string,
  page :number,
  totalHits :number,
  history :string[],
  isLoadingEdm :boolean,
  isLoadingEntitySets :boolean,
  entitySetSearchResults :List<*>,
  entitySetSizes :Map<*, *>,
  entityTypesById :Map<string, *>,
  showAssociationEntitySets :boolean,
  actions :{
    searchEntitySets :({
      searchTerm :string,
      start :number,
      maxHits :number
    }) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntitySetPage :(page :number) => void,
    setShowAssociationEntitySets :(show :boolean) => void,
    getNeighborTypes :(id :string) => void
  }
};

type State = {
  temp :boolean
};

const HeaderContainer = styled(HeaderComponentWrapper)`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const HeaderContent = styled.div`
  width: 560px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 50px 0;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  display: flex;
  flex-direction: row;

  span {
    margin-left: 20px;
    color: #b6bbc7;

    &:last-child {
      margin-left: 10px;
    }
  }
`;

const Subtitle = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  text-align: center;
  color: #8e929b;
  margin: 15px 0 50px 0;
`;

const ResultsContainer = styled(ComponentWrapper)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
`;

const CheckboxRow = styled(ComponentWrapper)`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const PAGE_SIZE = 24;

class EntitySetSearch extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: ''
    };

    this.searchTimeout = null;
  }

  componentDidMount() {
    const { actions } = this.props;
    this.executeSearch(1, '*');
  }

  executeSearch = (page, searchTermInit) => {
    const { actions } = this.props;

    actions.searchEntitySets({
      searchTerm: searchTermInit.length ? searchTermInit : '*',
      start: (page - 1) * PAGE_SIZE,
      maxHits: PAGE_SIZE
    });
  }

  handleInputChange = (e :SyntheticEvent) => {
    const { actions } = this.props;
    this.setState({ searchTerm: e.target.value });

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      const { searchTerm } = this.state;

      const newPage = 1;

      this.executeSearch(newPage, searchTerm);
      actions.selectEntitySetPage(newPage);
    }, 500);
  }

  handleSelect = (entitySetObj) => {
    const { actions, history, path } = this.props;
    const entitySet = entitySetObj.get('entitySet', Map());
    const id = entitySet.get('id');
    actions.selectEntitySet(entitySet);
    actions.getNeighborTypes(id);
    history.push(`${path}/${id}`);
  }

  renderResults = () => {
    const {
      isLoadingEdm,
      isLoadingEntitySets,
      entitySetSearchResults,
      entitySetSizes,
      entityTypesById,
      showAssociationEntitySets
    } = this.props;
    if (isLoadingEntitySets || isLoadingEdm) {
      return <LoadingSpinner />;
    }

    let filteredEntitySets = entitySetSearchResults;
    if (!showAssociationEntitySets) {
      filteredEntitySets = filteredEntitySets.filter(entitySetObj => entityTypesById
        .getIn([entitySetObj.getIn(['entitySet', 'entityTypeId']), 'category']) === 'EntityType');
    }

    return filteredEntitySets.map(entitySetObj => (
      <EntitySetCard
          key={entitySetObj.getIn(['entitySet', 'id'])}
          entitySet={entitySetObj.get('entitySet', Map())}
          size={entitySetSizes.get(entitySetObj.getIn(['entitySet', 'id']))}
          onClick={() => this.handleSelect(entitySetObj)} />
    ));
  }

  routeToManage = () => {
    this.props.history.push(Routes.MANAGE);
  }

  updatePage = (page) => {
    const { actions } = this.props;
    const { searchTerm } = this.state;
    this.executeSearch(page, searchTerm);
    actions.selectEntitySetPage(page);
  }

  render() {
    const {
      actions,
      actionText,
      page,
      showAssociationEntitySets,
      totalHits
    } = this.props;
    const { searchTerm } = this.state;

    return (
      <div>
        <HeaderContainer>
          <HeaderContent>
            <Title>Select a dataset to search</Title>
            <Subtitle>
              {`Choose a dataset you want to ${actionText}. If you
              don't see the dataset you're looking for,
              check`} <StyledLink onClick={this.routeToManage}>Data Management</StyledLink>
            </Subtitle>
            <StyledInput
                value={this.state.searchTerm}
                placeholder="Search"
                icon={faDatabase}
                onChange={this.handleInputChange} />
          </HeaderContent>
        </HeaderContainer>
        <CheckboxRow>
          <StyledCheckbox
              checked={showAssociationEntitySets}
              onChange={({ target }) => actions.setShowAssociationEntitySets(!!target.checked)}
              label="Show association datasets" />
        </CheckboxRow>
        <ResultsContainer>
          {this.renderResults()}
        </ResultsContainer>
        {
          totalHits > PAGE_SIZE ? (
            <Pagination
                numPages={Math.ceil(totalHits / PAGE_SIZE)}
                activePage={page}
                onChangePage={this.updatePage} />
          ) : null
        }
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const edm = state.get(STATE.EDM);
  const entitySets = state.get(STATE.ENTITY_SETS);

  return {
    entitySetSearchResults: entitySets.get(ENTITY_SETS.ENTITY_SET_SEARCH_RESULTS),
    entitySetSizes: entitySets.get(ENTITY_SETS.ENTITY_SET_SIZES),
    isLoadingEntitySets: entitySets.get(ENTITY_SETS.IS_LOADING_ENTITY_SETS),
    page: entitySets.get(ENTITY_SETS.PAGE),
    totalHits: entitySets.get(ENTITY_SETS.TOTAL_HITS),
    showAssociationEntitySets: entitySets.get(ENTITY_SETS.SHOW_ASSOCIATION_ENTITY_SETS),
    entityTypesById: edm.get(EDM.ENTITY_TYPES_BY_ID),
    isLoadingEdm: edm.get(EDM.IS_LOADING_EDM)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EntitySetActionFactory).forEach((action :string) => {
    actions[action] = EntitySetActionFactory[action];
  });

  Object.keys(TopUtilizersActionFactory).forEach((action :string) => {
    actions[action] = TopUtilizersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EntitySetSearch));
