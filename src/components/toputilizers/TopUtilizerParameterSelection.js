/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Map, List, Set } from 'immutable';
import { DatePicker } from '@atlaskit/datetime-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

import BackNavButton from '../buttons/BackNavButton';
import TabNavButton from '../buttons/TabNavButton';
import InfoButton from '../buttons/InfoButton';
import DropdownButtonWrapper from '../buttons/DropdownButtonWrapper';
import StyledCheckbox from '../controls/StyledCheckbox';
import TopUtilizersSelect from './TopUtilizersSelect';
import { FixedWidthWrapper, HeaderComponentWrapper } from '../layout/Layout';
import { DATE_FORMAT } from '../../utils/constants/DateTimeConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';

type Props = {
  display :string,
  searchHasRun :boolean,
  neighborTypes :List<*>,
  selectedEntitySet :?Map<*, *>,
  selectedEntitySetPropertyTypes :List<*>,
  selectedPropertyTypes :List<*>,
  onPropertyTypeChange :(propertyTypeId :string) => void,
  changeTopUtilizersDisplay :(display :string) => void,
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

const PropertyTypeWrapper = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: 32% 32% 32%;
  grid-auto-rows: 25px;
  grid-column-gap: 10px;
  grid-row-gap: 20px;
  grid-auto-flow: row;
  align-items: center;
`;

const TabButtonRow = styled.div`
  margin: 20px 0 -30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
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

    getTopUtilizers({
      entitySetId,
      numResults: DEFAULT_NUM_RESULTS,
      filters: selectedNeighborTypes
    });
  }

  renderPropertyTypeFilterOptions = () => {
    const { selectedEntitySetPropertyTypes, selectedPropertyTypes, onPropertyTypeChange } = this.props;

    return (
      <PropertyTypeWrapper>
        {selectedEntitySetPropertyTypes.map((propertyType) => {
          const id = propertyType.get('id');
          const title = propertyType.get('title');
          return (
            <div key={id}>
              <StyledCheckbox
                  checked={selectedPropertyTypes.has(id)}
                  value={id}
                  label={title}
                  onChange={onPropertyTypeChange} />
            </div>
          );
        })}
      </PropertyTypeWrapper>
    );
  }

  renderNavButton = (buttonDisplay) => {
    const { display, changeTopUtilizersDisplay } = this.props;

    const selected = buttonDisplay === display;
    return (
      <TabNavButton selected={selected} onClick={() => changeTopUtilizersDisplay(buttonDisplay)}>
        {buttonDisplay}
      </TabNavButton>
    );
  }

  render() {
    const { selectedNeighborTypes, startDate, endDate } = this.state;
    const {
      searchHasRun,
      selectedEntitySet,
      deselectEntitySet,
      neighborTypes
    } = this.props;

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
              <DropdownButtonWrapper title="Filter properties" width={800} short fullSize>
                {this.renderPropertyTypeFilterOptions()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <InfoButton onClick={this.searchTopUtilizers} fullSize>Find Top Utilizers</InfoButton>
            </InputGroup>
          </InputRow>
          {
            searchHasRun ? (
              <TabButtonRow>
                {this.renderNavButton(RESULT_DISPLAYS.SEARCH_RESULTS)}
                {this.renderNavButton(RESULT_DISPLAYS.DASHBOARD)}
                {this.renderNavButton(RESULT_DISPLAYS.RESOURCES)}
              </TabButtonRow>
            ) : null
          }
        </FixedWidthWrapper>
      </CenteredHeaderWrapper>
    );
  }
}
