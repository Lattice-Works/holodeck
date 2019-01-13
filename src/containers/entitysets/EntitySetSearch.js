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
import EntitySetCard from '../../components/cards/EntitySetCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/explore/Pagination';
import { ENTITY_SETS, STATE } from '../../utils/constants/StateConstants';
import { ComponentWrapper, HeaderComponentWrapper } from '../../components/layout/Layout';
import * as Routes from '../../core/router/Routes';
import * as EntitySetActionFactory from './EntitySetActionFactory';
import * as TopUtilizersActionFactory from '../toputilizers/TopUtilizersActionFactory';

type Props = {
  actionText :string,
  page :number,
  totalHits :number,
  history :string[],
  isLoadingEntitySets :boolean,
  entitySetSearchResults :List<*>,
  entitySetSizes :Map<*, *>,
  actions :{
    searchEntitySets :({
      searchTerm :string,
      start :number,
      maxHits :number
    }) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntitySetPage :(page :number) => void,
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
    this.setState({ searchTerm: e.target.value });

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      const { page } = this.props;
      const { searchTerm } = this.state;

      this.executeSearch(page, searchTerm);
    }, 500);
  }

  handleSelect = (entitySetObj) => {
    const { actions } = this.props;
    const entitySet = entitySetObj.get('entitySet', Map());
    actions.selectEntitySet(entitySet);
    actions.getNeighborTypes(entitySet.get('id'));
  }

  renderResults = () => {
    const {
      isLoadingEntitySets,
      entitySetSearchResults,
      entitySetSizes,
      actions
    } = this.props;
    if (isLoadingEntitySets) {
      return <LoadingSpinner />;
    }

    return entitySetSearchResults.map(entitySetObj => (
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
    const { actionText, page, totalHits } = this.props;
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
  const entitySets = state.get(STATE.ENTITY_SETS);
  return {
    entitySetSearchResults: entitySets.get(ENTITY_SETS.ENTITY_SET_SEARCH_RESULTS),
    entitySetSizes: entitySets.get(ENTITY_SETS.ENTITY_SET_SIZES),
    isLoadingEntitySets: entitySets.get(ENTITY_SETS.IS_LOADING_ENTITY_SETS),
    page: entitySets.get(ENTITY_SETS.PAGE),
    totalHits: entitySets.get(ENTITY_SETS.TOTAL_HITS)
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
