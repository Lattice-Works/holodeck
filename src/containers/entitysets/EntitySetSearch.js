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
import { ENTITY_SETS, STATE } from '../../utils/constants/StateConstants';
import * as EntitySetActionFactory from './EntitySetActionFactory';

type Props = {
  entitySetSearchResults :Immutable.List<*>,
  selectedEntitySet :?Immutable.Map<*, *>,
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

const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  margin: 15px 0 40px 0;

  span {
    margin-left: 20px;
    color: #b6bbc7;

    &:last-child {
      margin-left: 10px;
    }
  }

`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  width: ${props => (props.fullSize ? '100%' : '24%')};
`;

const InputLabel = styled.span`
  color: #8e929b;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
`;

const DatePickerWrapper = styled.div`
  width: 100%;
`;

class EntitySetSearch extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchParameter: '',
      startDate: '',
      endDate: ''
    };
  }

  renderParameterSelection = () => {
    const { selectedEntitySet } = this.props;
    const { searchParameter, startDate, endDate } = this.state;
    const entitySetTitle = selectedEntitySet.get('title');
    return (
      <div>
        <BackNavButton onClick={() => this.props.actions.selectEntitySet()}>Back to dataset selection</BackNavButton>
        <Title>
          <div>Search</div>
          <span><FontAwesomeIcon icon={faDatabase} /></span>
          <span>{entitySetTitle}</span>
        </Title>
        <InputRow>
          <InputGroup fullSize>
            <InputLabel>Search Parameter</InputLabel>
            <StyledInput value={searchParameter} onChange={this.handleSearchParameterChange} />
          </InputGroup>
        </InputRow>
        <InputRow>
          <InputGroup>
            <InputLabel>Date Range Start</InputLabel>
            <DatePickerWrapper>
              <DatePicker value={startDate} onChange={date => this.setState({ startDate: date })} />
            </DatePickerWrapper>
          </InputGroup>
          <InputGroup>
            <InputLabel>Date Range End</InputLabel>
            <DatePickerWrapper>
              <DatePicker value={endDate} onChange={date => this.setState({ endDate: date })} />
            </DatePickerWrapper>
          </InputGroup>
          <InputGroup>
            <DropdownButton fullSize title="Filter properties" options={[]} />
          </InputGroup>
          <InputGroup>
            <InfoButton fullSize>Find Top Utilizers</InfoButton>
          </InputGroup>
        </InputRow>
      </div>
    );
  }

  handleSearchParameterChange = (e :SyntheticEvent) => {
    this.setState({ searchParameter: e.target.value });
  }

  render() {
    const { selectedEntitySet } = this.props;
    return (
      <div>
        {selectedEntitySet ? this.renderParameterSelection() : null}
      </div>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const entitySets = state.get(STATE.ENTITY_SETS);
  return {
    entitySetSearchResults: entitySets.get(ENTITY_SETS.ENTITY_SET_SEARCH_RESULTS),
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET)
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
