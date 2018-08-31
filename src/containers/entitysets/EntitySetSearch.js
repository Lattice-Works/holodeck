/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DatePicker } from '@atlaskit/datetime-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

import BackNavButton from '../../components/buttons/BackNavButton';
import InfoButton from '../../components/buttons/InfoButton';
import DropdownButton from '../../components/buttons/DropdownButton';
import StyledInput from '../../components/controls/StyledInput';
import StyledLink from '../../components/controls/StyledLink';
import EntitySetCard from '../../components/cards/EntitySetCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ENTITY_SETS, STATE } from '../../utils/constants/StateConstants';
import { ComponentWrapper, HeaderComponentWrapper } from '../../components/layout/Layout';
import * as EntitySetActionFactory from './EntitySetActionFactory';

type Props = {
  isLoadingEntitySets :boolean,
  entitySetSearchResults :Immutable.List<*>,
  actions :{
    searchEntitySets :({
      searchTerm :string,
      start :number,
      maxHits :number
    }) => void,
    selectEntitySet :(entitySet? :Immutable.Map<*, *>) => void
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

class EntitySetSearch extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: ''
    };

    this.searchTimeout = null;
  }

  handleInputChange = (e :SyntheticEvent) => {
    this.setState({ searchTerm: e.target.value });

    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.props.actions.searchEntitySets({
        searchTerm: this.state.searchTerm,
        start: 0,
        maxHits: 10
      })
    }, 500);
  }

  renderResults = () => {
    const { isLoadingEntitySets, entitySetSearchResults, actions } = this.props;
    if (isLoadingEntitySets) {
      return <LoadingSpinner />;
    }

    return entitySetSearchResults.map(entitySetObj => (
      <EntitySetCard
          key={entitySetObj.getIn(['entitySet', 'id'])}
          entitySet={entitySetObj.get('entitySet', Immutable.Map())}
          onClick={() => actions.selectEntitySet(entitySetObj.get('entitySet', Immutable.Map()))} />
    ));
  }

  render() {
    return (
      <div>
        <HeaderContainer>
          <HeaderContent>
            <Title>Select a dataset to search</Title>
            <Subtitle>
              Choose a dataset you want to find to utilizers in. If you
              don't see the dataset you're looking for, check <StyledLink>Data Management</StyledLink>
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
      </div>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const entitySets = state.get(STATE.ENTITY_SETS);
  return {
    entitySetSearchResults: entitySets.get(ENTITY_SETS.ENTITY_SET_SEARCH_RESULTS),
    isLoadingEntitySets: entitySets.get(ENTITY_SETS.IS_LOADING_ENTITY_SETS)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EntitySetActionFactory).forEach((action :string) => {
    actions[action] = EntitySetActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EntitySetSearch));
