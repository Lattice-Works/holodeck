/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import { DatePicker } from '@atlaskit/datetime-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

import BackNavButton from '../buttons/BackNavButton';
import InfoButton from '../buttons/InfoButton';
import DropdownButton from '../buttons/DropdownButton';
import StyledInput from '../controls/StyledInput';
import { ComponentWrapper, HeaderComponentWrapper } from '../../components/layout/Layout';

type Props = {
  selectedEntitySet :?Immutable.Map<*, *>,
  deselectEntitySet :() => void
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

export default class TopUtilizerParameterSelection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchParameter: '',
      startDate: '',
      endDate: ''
    };
  }

  handleSearchParameterChange = (e :SyntheticEvent) => {
    this.setState({ searchParameter: e.target.value });
  }

  render() {
    const { selectedEntitySet, deselectEntitySet } = this.props;
    const { searchParameter, startDate, endDate } = this.state;
    const entitySetTitle = selectedEntitySet.get('title');
    return (
      <HeaderComponentWrapper>
        <ComponentWrapper>
          <BackNavButton onClick={deselectEntitySet}>Back to dataset selection</BackNavButton>
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
        </ComponentWrapper>
      </HeaderComponentWrapper>
    );
  }
}
