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
  showAssociationEntitySets :boolean,
  showAuditEntitySets :boolean,
  actions :{
    searchEntitySets :({
      searchTerm :string,
      start :number,
      maxHits :number
    }) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntitySetPage :(page :number) => void,
    setShowAssociationEntitySets :(show :boolean) => void,
    setShowAuditEntitySets :(show :boolean) => void,
    getNeighborTypes :(id :string) => void
  }
};

type State = {
  searchTerm :string;
};

class EntitySetSearch extends React.Component<Props, State> {

  searchTimeout :?TimeoutID;

  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: ''
    };

    this.searchTimeout = null;
  }

  componentDidMount() {
    this.executeSearch(1, '*');
  }

  executeSearch = (page, searchTermInit) => {
    const { actions } = this.props;

    actions.searchEntitySets({
      searchTerm: searchTermInit.length ? searchTermInit : '*',
      start: 0,
      maxHits: 10000
    });
  }

  handleInputChange = (e :any) => {
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
    } = this.props;

    if (isLoadingEntitySets || isLoadingEdm) {
      return <LoadingSpinner />;
    }

    return entitySetSearchResults.map((entitySetObj) => (
      <EntitySetCard
          key={entitySetObj.getIn(['entitySet', 'id'])}
          entitySet={entitySetObj.get('entitySet', Map())}
          size={entitySetSizes.get(entitySetObj.getIn(['entitySet', 'id']))}
          onClick={() => this.handleSelect(entitySetObj)} />
    ));
  }

  routeToManage = () => {
    const { history } = this.props;
    history.push(Routes.MANAGE);
  }

  render() {
    const {
      actions,
      actionText,
      page,
      showAssociationEntitySets,
      showAuditEntitySets,
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
                value={searchTerm}
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
          <StyledCheckbox
              checked={showAuditEntitySets}
              onChange={({ target }) => actions.setShowAuditEntitySets(!!target.checked)}
              label="Show audit datasets" />
        </CheckboxRow>
        <ResultsContainer>
          {this.renderResults()}
        </ResultsContainer>
        {
          totalHits > PAGE_SIZE ? (
            <Pagination
                numPages={Math.ceil(totalHits / PAGE_SIZE)}
                activePage={page}
                onChangePage={actions.selectEntitySetPage} />
          ) : null
        }
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const edm = state.get(STATE.EDM);
  const entitySets = state.get(STATE.ENTITY_SETS);

  const showAssociationEntitySets = entitySets.get(ENTITY_SETS.SHOW_ASSOCIATION_ENTITY_SETS);
  const showAuditEntitySets = entitySets.get(ENTITY_SETS.SHOW_AUDIT_ENTITY_SETS);
  const page = entitySets.get(ENTITY_SETS.PAGE);

  let entitySetSearchResults = entitySets.get(ENTITY_SETS.ENTITY_SET_SEARCH_RESULTS);
  if (!showAssociationEntitySets || !showAuditEntitySets) {
    entitySetSearchResults = entitySetSearchResults.filter((entitySetObj) => {
      const flags = entitySetObj.getIn(['entitySet', 'flags'], List());
      if (!showAssociationEntitySets && flags.includes('ASSOCIATION')) {
        return false;
      }
      if (!showAuditEntitySets && flags.includes('AUDIT')) {
        return false;
      }

      return true;
    });
  }
  const totalHits = entitySetSearchResults.size;

  entitySetSearchResults = entitySetSearchResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    page,
    entitySetSearchResults,
    showAssociationEntitySets,
    showAuditEntitySets,
    totalHits,
    entitySetSizes: entitySets.get(ENTITY_SETS.ENTITY_SET_SIZES),
    isLoadingEntitySets: entitySets.get(ENTITY_SETS.IS_LOADING_ENTITY_SETS),
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
