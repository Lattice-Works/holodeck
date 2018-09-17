/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {
  Map,
  List,
  Set,
  OrderedSet,
  fromJS
} from 'immutable';
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
import { DATE_DATATYPES } from '../../utils/constants/DataModelConstants';
import { RESULT_DISPLAYS, TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';

type Props = {
  display :string,
  searchHasRun :boolean,
  neighborTypes :List<*>,
  propertyTypesById :Map<string, Map<*, *>>,
  entityTypesById :Map<string, Map<*, *>>,
  selectedEntitySet :?Map<*, *>,
  selectedEntitySetPropertyTypes :List<*>,
  selectedPropertyTypes :List<*>,
  onPropertyTypeChange :(propertyTypeId :string) => void,
  changeTopUtilizersDisplay :(display :string) => void,
  deselectEntitySet :() => void,
  getTopUtilizers :() => void
};

type State = {
  temp :boolean,
  dateRanges :List
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

const DateInputGroup = styled(InputGroup)`
  width: 250px;
  margin-right: 20px;
  margin-top: 20px;
`;

const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
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

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CheckboxTitle = styled.div`
  width: fit-content;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #555e6f;
  margin-bottom: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e6eb;
`;

const DateTab = styled.div`
  padding-bottom: 20px;
  margin-bottom: -20px;
  margin-right: 30px;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${props => (props.selected ? '#555e6f' : '#8e929b')};
  border-bottom: 1px solid ${props => (props.selected ? '#555e6f' : 'transparent')};

  &:hover {
    cursor: pointer;
  }
`;

const PropertyCheckboxWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
`;

const SingleCheckboxWrapper = styled.div`
  padding: 10px;
  width: 240px;
`;

const DEFAULT_NUM_RESULTS = 100;

const newDateRange = Object.assign({}, {
  start: '',
  end: '',
  properties: Set()
});

export default class TopUtilizerParameterSelection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      selectedNeighborTypes: [],
      dateRanges: List.of(newDateRange),
      dateRangeViewing: 0,
      startDate: '',
      endDate: ''
    };
  }

  searchTopUtilizers = () => {
    const { getTopUtilizers, selectedEntitySet } = this.props;
    const { dateRanges, selectedNeighborTypes } = this.state;
    const entitySetId = selectedEntitySet.get('id');

    getTopUtilizers({
      entitySetId,
      numResults: DEFAULT_NUM_RESULTS,
      eventFilters: selectedNeighborTypes,
      dateFilters: dateRanges
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

  renderSearchOption = () => {
    return (
      <DropdownWrapper>
        <CheckboxTitle>Count Type</CheckboxTitle>
        <RowWrapper>
          <StyledCheckbox
              label="Events" />
          <StyledCheckbox
              label="Hours" />
        </RowWrapper>
      </DropdownWrapper>
    );
  }

  renderDateRangeSelection = () => {
    const { dateRanges, dateRangeViewing } = this.state;

    const selectedDateRange = dateRanges.get(dateRangeViewing);
    const { start, end } = selectedDateRange;

    const onChange = (key, valueStr) => {
      const valueMoment = moment(valueStr);
      const value = valueMoment.isValid() ? valueMoment.format(DATE_FORMAT) : '';
      const newValue = Object.assign({}, selectedDateRange, { [key]: value });
      this.setState({ dateRanges: dateRanges.set(dateRangeViewing, newValue) });
    };

    return (
      <TabsContainer>
        <DateInputGroup>
          <InputLabel>Date Range Start</InputLabel>
          <DatePickerWrapper>
            <DatePicker
                value={start}
                dateFormat={DATE_FORMAT}
                onChange={date => onChange('start', date)}
                selectProps={{
                  placeholder: `e.g. ${moment().format(DATE_FORMAT)}`,
                }} />
          </DatePickerWrapper>
        </DateInputGroup>
        <DateInputGroup>
          <InputLabel>Date Range End</InputLabel>
          <DatePickerWrapper>
            <DatePicker
                value={end}
                dateFormat={DATE_FORMAT}
                onChange={date => onChange('end', date)}
                selectProps={{
                  placeholder: `e.g. ${moment().format(DATE_FORMAT)}`,
                }} />
          </DatePickerWrapper>
        </DateInputGroup>
      </TabsContainer>
    );
  }

  renderSelectedRangesTab = () => {
    const { dateRanges, dateRangeViewing } = this.state;
    let tabs = dateRanges.map((range, index) => {
      const { start, end } = range;
      const text = (start.length && end.length) ? `${start} - ${end}` : 'New date range';
      return (
        <DateTab
            key={index}
            selected={index === dateRangeViewing}
            onClick={() => this.setState({ dateRangeViewing: index })}>
          {text}
        </DateTab>
      );
    });
    if (!dateRanges.filter(range => !range.start.length && !range.end.length).size) {
      tabs = tabs.push((
        <DateTab
            key={-1}
            onClick={() => this.setState({
              dateRanges: dateRanges.push(newDateRange),
              dateRangeViewing: dateRanges.size
            })}>
          Add New
        </DateTab>
      ));
    }
    return <TabsContainer>{tabs}</TabsContainer>;
  }

  getDateProperties = () => {
    const { selectedNeighborTypes } = this.state;
    const {
      selectedEntitySet,
      entityTypesById,
      propertyTypesById
    } = this.props;
    let dateProperties = OrderedSet();
    let entityTypeIds = OrderedSet.of(selectedEntitySet.get('entityTypeId'));
    selectedNeighborTypes.forEach((neighborTypes) => {
      entityTypeIds = entityTypeIds.add(neighborTypes[TOP_UTILIZERS_FILTER.ASSOC_ID]);
      entityTypeIds = entityTypeIds.add(neighborTypes[TOP_UTILIZERS_FILTER.NEIGHBOR_ID]);
    });

    entityTypeIds.forEach((eid) => {
      entityTypesById.getIn([eid, 'properties'], List()).forEach((pid) => {
        if (DATE_DATATYPES.includes(propertyTypesById.getIn([pid, 'datatype']))) {
          dateProperties = dateProperties.add(List.of(eid, pid));
        }
      });
    });

    return dateProperties;
  }

  getDatePropertyLabel = (pair) => {
    const { entityTypesById, propertyTypesById } = this.props;
    const entityTypeTitle = entityTypesById.getIn([pair.get(0), 'title'], '');
    const propertyTypeTitle = propertyTypesById.getIn([pair.get(1), 'title'], '');
    return `${propertyTypeTitle} of ${entityTypeTitle}`;
  }

  renderDatePropertySelection = () => {
    const { dateRanges, dateRangeViewing } = this.state;

    const selectedDateRange = dateRanges.get(dateRangeViewing);
    const { start, end, properties } = selectedDateRange;
    if (!start.length && !end.length) return <PropertyCheckboxWrapper />;

    let reserved = Set();
    dateRanges.forEach((dateRange, index) => {
      if (index !== dateRangeViewing) {
        reserved = reserved.union(dateRange.properties);
      }
    });

    const onChange = (e, datePair) => {
      const { checked } = e.target;
      const newProperties = checked ? properties.add(datePair) : properties.delete(datePair);
      const updatedDateRange = Object.assign({}, selectedDateRange, { properties: newProperties });
      this.setState({ dateRanges: dateRanges.set(dateRangeViewing, updatedDateRange) });
    };

    const checkboxes = this.getDateProperties().map((datePair) => {
      return (
        <SingleCheckboxWrapper key={datePair}>
          <StyledCheckbox
              label={this.getDatePropertyLabel(datePair)}
              checked={properties.has(datePair)}
              disabled={reserved.has(datePair)}
              onChange={e => onChange(e, datePair)} />
        </SingleCheckboxWrapper>
      );
    });

    return (
      <PropertyCheckboxWrapper>
        {checkboxes}
      </PropertyCheckboxWrapper>
    );
  }

  renderDateRangePicker = () => {
    return (
      <DropdownWrapper>
        {this.renderSelectedRangesTab()}
        {this.renderDateRangeSelection()}
        {this.renderDatePropertySelection()}
      </DropdownWrapper>
    )
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
              <DropdownButtonWrapper title="Search Option" short fullSize>
                {this.renderSearchOption()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Date Range" width={800} short fullSize>
                {this.renderDateRangePicker()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Properties" width={800} short fullSize>
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
