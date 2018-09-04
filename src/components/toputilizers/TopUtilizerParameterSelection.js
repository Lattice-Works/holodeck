/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';
import moment from 'moment';
import { DatePicker } from '@atlaskit/datetime-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

import BackNavButton from '../buttons/BackNavButton';
import InfoButton from '../buttons/InfoButton';
import DropdownButton from '../buttons/DropdownButton';
import DropdownButtonWrapper from '../buttons/DropdownButtonWrapper';
import CheckboxDropdownButton from '../buttons/CheckboxDropdownButton';
import StyledInput from '../controls/StyledInput';
import TopUtilizersSelect from './TopUtilizersSelect';
import { ComponentWrapper, FixedWidthWrapper, HeaderComponentWrapper } from '../layout/Layout';
import { DATE_FORMAT } from '../../utils/constants/DateTimeConstants';

type Props = {
  selectedEntitySet :?Immutable.Map<*, *>,
  selectedEntitySetPropertyTypes :Immutable.List<*>,
  selectedPropertyTypes :Immutable.List<*>,
  onPropertyTypeChange :(propertyType :Immutable.Map<*, *>) => void,
  neighborTypes :Immutable.List<*>,
  deselectEntitySet :() => void,
  getTopUtilizers :() => void
};

type State = {
  temp :boolean
};

const CenteredHeaderWrapper = styled(HeaderComponentWrapper)`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;

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
`;

const DatePickerWrapper = styled.div`
  width: 100%;
`;

const DEFAULT_NUM_RESULTS = 100;

export default class TopUtilizerParameterSelection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      selectedNeighborTypes: [],
      startDate: '',
      endDate: ''
    };
  }

  searchTopUtilizers = () => {
    const { getTopUtilizers, selectedEntitySet } = this.props;
    const { selectedNeighborTypes } = this.state;
    const entitySetId = selectedEntitySet.get('id');

    const filters = selectedNeighborTypes.map(selectedType => ({
      associationTypeId: selectedType.assocId,
      neighborTypeIds: [selectedType.neighborId],
      utilizerIsSrc: selectedType.src
    }));

    getTopUtilizers({
      entitySetId,
      numResults: DEFAULT_NUM_RESULTS,
      filters
    });
  }

  getPropertyFilterOptions = () => {
    const { selectedEntitySetPropertyTypes } = this.props;
    return selectedEntitySetPropertyTypes.map(propertyType => ({
      label: propertyType.get('title'),
      value: propertyType
    })).toArray();
  }

  render() {
    const {
      selectedEntitySet,
      deselectEntitySet,
      neighborTypes,
      selectedPropertyTypes,
      onPropertyTypeChange
    } = this.props;
    const { selectedNeighborTypes, startDate, endDate } = this.state;
    const entitySetTitle = selectedEntitySet.get('title');
    return (
      <CenteredHeaderWrapper>
        <FixedWidthWrapper>
          <BackNavButton onClick={deselectEntitySet}>Back to dataset selection</BackNavButton>
          <Title>
            <div>Search</div>
            <span><FontAwesomeIcon icon={faDatabase} /></span>
            <span>{entitySetTitle}</span>
          </Title>
          <InputRow>
            <InputGroup fullSize>
              <InputLabel>Search Parameter</InputLabel>
              <TopUtilizersSelect
                  selectedEntitySet={selectedEntitySet}
                  neighborTypes={neighborTypes}
                  selectedNeighborTypes={selectedNeighborTypes}
                  onChange={newList => this.setState({ selectedNeighborTypes: newList })} />
            </InputGroup>
          </InputRow>
          <InputRow>
            <InputGroup>
              <InputLabel>Date Range Start</InputLabel>
              <DatePickerWrapper>
                <DatePicker
                    value={startDate}
                    dateFormat={DATE_FORMAT}
                    onChange={date => this.setState({ startDate: date })}
                    selectProps={{
                      placeholder: `e.g. ${moment().format(DATE_FORMAT)}`,
                    }} />
              </DatePickerWrapper>
            </InputGroup>
            <InputGroup>
              <InputLabel>Date Range End</InputLabel>
              <DatePickerWrapper>
                <DatePicker
                    value={endDate}
                    dateFormat={DATE_FORMAT}
                    onChange={date => this.setState({ endDate: date })}
                    selectProps={{
                      placeholder: `e.g. ${moment().format(DATE_FORMAT)}`,
                    }} />
              </DatePickerWrapper>
            </InputGroup>
            <InputGroup>
              <CheckboxDropdownButton
                  short
                  fullSize
                  title="Filter properties"
                  selected={selectedPropertyTypes}
                  onChange={onPropertyTypeChange}
                  options={this.getPropertyFilterOptions()} />
            </InputGroup>
            <InputGroup>
              <InfoButton onClick={this.searchTopUtilizers} fullSize>Find Top Utilizers</InfoButton>
            </InputGroup>
          </InputRow>
        </FixedWidthWrapper>
      </CenteredHeaderWrapper>
    );
  }
}
