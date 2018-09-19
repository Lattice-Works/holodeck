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
import UtilityButton from '../buttons/UtilityButton';
import DropdownButtonWrapper from '../buttons/DropdownButtonWrapper';
import StyledCheckbox from '../controls/StyledCheckbox';
import StyledRadio from '../controls/StyledRadio';
import TopUtilizersSelect from './TopUtilizersSelect';
import NumberInputTable from '../tables/NumberInputTable';
import { FixedWidthWrapper, HeaderComponentWrapper } from '../layout/Layout';
import { DATE_FORMAT } from '../../utils/constants/DateTimeConstants';
import { DATE_DATATYPES, DURATION_TYPES } from '../../utils/constants/DataModelConstants';
import { COUNT_TYPES, RESULT_DISPLAYS, TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { isNotNumber } from '../../utils/ValidationUtils';
import { getFqnString } from '../../utils/DataUtils';

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
  countType :boolean,
  dateRanges :List,
  dateRangeViewing :boolean,
  selectedNeighborTypes :Object[],
  durationTypeWeights :Map<*, *>
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
  width: ${props => (props.fullSize ? '100%' : '19%')};
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
  padding: ${props => (props.noPadding ? 0 : '20px')};
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
  grid-template-columns: ${props => (props.twoCols ? '48% 48%' : '32% 32% 32%')};
  grid-auto-rows: 25px;
  grid-column-gap: 10px;
  grid-row-gap: ${props => (props.twoCols ? 30 : 20)}px;
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
  width: 100%;
`;

const RightRowWrapper = styled(RowWrapper)`
  justify-content: flex-end;
  margin-top: 15px;
`;

const RadioTitle = styled.div`
  width: fit-content;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #555e6f;
  margin-bottom: 10px;
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

const DropdownTab = styled.div`
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

const TopBorderRowWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  margin-top: 20px;
  border-top: 1px solid #e6e6eb;

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #555e6f;
  }
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
      countType: COUNT_TYPES.EVENTS,
      durationTypeWeights: Map()
    };
  }

  searchTopUtilizers = () => {
    const { entityTypesById, getTopUtilizers, selectedEntitySet } = this.props;
    const {
      countType,
      dateRanges,
      durationTypeWeights,
      selectedNeighborTypes
    } = this.state;
    const entitySetId = selectedEntitySet.get('id');

    getTopUtilizers({
      entitySetId,
      numResults: DEFAULT_NUM_RESULTS,
      eventFilters: selectedNeighborTypes,
      dateFilters: dateRanges,
      countType,
      durationTypeWeights,
      entityTypesById
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

  getDurationPropertiesForType = (entityTypeId) => {
    const { entityTypesById, propertyTypesById } = this.props;

    return entityTypesById.getIn([entityTypeId, 'properties'], List())
      .filter((propertyTypeId) => {
        const fqn = getFqnString(propertyTypesById.getIn([propertyTypeId, 'type']));
        return !!DURATION_TYPES[fqn];
      });

  }

  getAvailableDurationProperties = () => {
    const { selectedNeighborTypes } = this.state;

    let available = Map();

    selectedNeighborTypes.forEach((neighborTypeObj) => {
      const assocId = neighborTypeObj[TOP_UTILIZERS_FILTER.ASSOC_ID];
      const neighborId = neighborTypeObj[TOP_UTILIZERS_FILTER.NEIGHBOR_ID];

      const durationProperties = this.getDurationPropertiesForType(assocId)
        .concat(this.getDurationPropertiesForType(neighborId))

      if (durationProperties.size) {
        available = available.set(List.of(assocId, neighborId), durationProperties);
      }
    });

    return available;
  }

  renderSearchOption = () => {
    const { entityTypesById, propertyTypesById } = this.props;
    const { countType, durationTypeWeights, selectedNeighborTypes } = this.state;

    const onChange = e => this.setState({ countType: e.target.value });
    const availableDurationProperties = this.getAvailableDurationProperties();

    return (
      <DropdownWrapper>
        <RadioTitle>Count Type</RadioTitle>
        <RowWrapper>
          <StyledRadio
              checked={countType === COUNT_TYPES.EVENTS}
              value={COUNT_TYPES.EVENTS}
              onChange={onChange}
              label="Events" />
          <StyledRadio
              disabled={availableDurationProperties.size !== selectedNeighborTypes.length}
              checked={countType === COUNT_TYPES.DURATION}
              value={COUNT_TYPES.DURATION}
              onChange={onChange}
              label="Duration" />
        </RowWrapper>
        {
          countType === COUNT_TYPES.DURATION ? (
            <DropdownWrapper noPadding>
              <TopBorderRowWrapper>
                <div>Properties to include</div>
              </TopBorderRowWrapper>
              <PropertyTypeWrapper twoCols>
                {availableDurationProperties.entrySeq().flatMap(([pair, propertyTypeIds]) => {
                  const assocTitle = entityTypesById.getIn([pair.get(0), 'title'], '');
                  const neighborTitle = entityTypesById.getIn([pair.get(1), 'title'], '');

                  return propertyTypeIds.map((propertyTypeId) => {
                    const weight = durationTypeWeights.getIn([pair, propertyTypeId], 0);
                    const propertyTypeTitle = propertyTypesById.getIn([propertyTypeId, 'title'], '');
                    const label = `${assocTitle} ${neighborTitle} -- ${propertyTypeTitle}`;
                    const onDurationChange = (e) => {
                      const { checked } = e.target;
                      const newWeight = checked ? 1 : 0;
                      this.setState({
                        durationTypeWeights: durationTypeWeights.setIn([pair, propertyTypeId], newWeight)
                      });
                    }
                    return (
                      <div key={label}>
                        <StyledCheckbox
                            checked={weight > 0}
                            label={label}
                            onChange={onDurationChange} />
                      </div>
                    );
                  });
                })}
              </PropertyTypeWrapper>
            </DropdownWrapper>
          ) : null
        }
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
        <DropdownTab
            key={index}
            selected={index === dateRangeViewing}
            onClick={() => this.setState({ dateRangeViewing: index })}>
          {text}
        </DropdownTab>
      );
    });
    if (!dateRanges.filter(range => !range.start.length && !range.end.length).size) {
      tabs = tabs.push((
        <DropdownTab
            key={-1}
            onClick={() => this.setState({
              dateRanges: dateRanges.push(newDateRange),
              dateRangeViewing: dateRanges.size
            })}>
          Add New
        </DropdownTab>
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

  renderDateRangePicker = () => (
    <DropdownWrapper>
      {this.renderSelectedRangesTab()}
      {this.renderDateRangeSelection()}
      {this.renderDatePropertySelection()}
    </DropdownWrapper>
  )

  resetWeights = () => {
    const { selectedNeighborTypes } = this.state;
    const resetTypes = selectedNeighborTypes.map(type => Object.assign({}, type, { [TOP_UTILIZERS_FILTER.WEIGHT]: 1 }));
    this.setState({ selectedNeighborTypes: resetTypes });
  }

  renderWeightsPicker = () => {
    const { selectedNeighborTypes } = this.state;
    const rows = fromJS(selectedNeighborTypes.map((option, index) => {
      const label = `${option[TOP_UTILIZERS_FILTER.ASSOC_TITLE]} ${option[TOP_UTILIZERS_FILTER.NEIGHBOR_TITLE]}`;
      const value = option[TOP_UTILIZERS_FILTER.WEIGHT];
      const key = index;
      return { key, value, label };
    }));

    const onChange = (index, value) => {
      const formattedValue = value === '.' ? '0.' : value;
      if (!isNotNumber(formattedValue) || formattedValue === '') {
        selectedNeighborTypes[index][TOP_UTILIZERS_FILTER.WEIGHT] = formattedValue;
        this.setState({ selectedNeighborTypes });
      }
    };

    return (
      <DropdownWrapper>
        <TabsContainer>
          <DropdownTab selected>Events</DropdownTab>
        </TabsContainer>
        <RightRowWrapper>
          <UtilityButton onClick={this.resetWeights}>Reset Weights</UtilityButton>
        </RightRowWrapper>
        <NumberInputTable
            keyHeader="Events"
            valueHeader="Weight"
            rows={rows}
            onChange={onChange} />
      </DropdownWrapper>
    );
  }

  onSelectedNeighborPairChange = (newList) => {
    const { countType, durationTypeWeights } = this.state;

    let newDurationTypeWeights = Map();

    newList.forEach((neighborTypeObj) => {
      const assocId = neighborTypeObj[TOP_UTILIZERS_FILTER.ASSOC_ID];
      const neighborId = neighborTypeObj[TOP_UTILIZERS_FILTER.NEIGHBOR_ID];

      const durationPropertyTypes = this.getDurationPropertiesForType(assocId)
        .concat(this.getDurationPropertiesForType(neighborId));

      if (durationPropertyTypes.size) {
        const pair = List.of(assocId, neighborId);
        durationPropertyTypes.forEach((propertyTypeId) => {

          newDurationTypeWeights = newDurationTypeWeights.setIn(
            [pair, propertyTypeId],
            durationTypeWeights.getIn([pair, propertyTypeId], 1)
          );

        });
      }
    });

    const newCountType = newList.length === newDurationTypeWeights.size ? countType : COUNT_TYPES.EVENTS;

    this.setState({
      selectedNeighborTypes: newList,
      durationTypeWeights: newDurationTypeWeights,
      countType: newCountType
    });
  }

  render() {
    const { selectedNeighborTypes } = this.state;
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
                  onChange={this.onSelectedNeighborPairChange} />
            </InputGroup>
          </InputRow>
          <InputRow>
            <InputGroup>
              <DropdownButtonWrapper title="Search Option" width={550} short fullSize>
                {this.renderSearchOption()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Date Range" width={800} short fullSize>
                {this.renderDateRangePicker()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Weights" width={600} short fullSize>
                {this.renderWeightsPicker()}
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
