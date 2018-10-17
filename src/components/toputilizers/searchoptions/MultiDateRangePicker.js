/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import {
  List,
  Map,
  OrderedSet,
  Set
} from 'immutable';
import { DatePicker } from '@atlaskit/datetime-picker';

import StyledCheckbox from '../../controls/StyledCheckbox';
import {
  DropdownWrapper,
  DropdownTab,
  InputGroup,
  InputLabel,
  TabsContainer
} from '../../layout/Layout';
import { DATE_FORMAT } from '../../../utils/constants/DateTimeConstants';
import { DATE_DATATYPES } from '../../../utils/constants/DataModelConstants';
import { TOP_UTILIZERS_FILTER } from '../../../utils/constants/TopUtilizerConstants';

type Props = {
  dateRanges :List,
  dateRangeViewing :boolean,
  selectedNeighborTypes :Object[],
  entityTypesById :Map<string, *>,
  propertyTypesById :Map<string, *>,
  onAddRange :() => void,
  setDateRangeViewing :(index :number) => void,
  onDateRangeChange :(dateRanges :List<*>) => void
}

const DateInputGroup = styled(InputGroup)`
  width: 250px;
  margin-right: 20px;
  margin-top: 20px;
`;

const DatePickerWrapper = styled.div`
  width: 100%;
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

const SelectedRangesTab = ({
  dateRanges,
  dateRangeViewing,
  onAddRange,
  setDateRangeViewing
} :Props) => {
  let tabs = dateRanges.map((range, index) => {
    const { start, end } = range;
    const text = (start.length && end.length) ? `${start} - ${end}` : 'New date range';
    return (
      <DropdownTab
          key={index}
          selected={index === dateRangeViewing}
          onClick={() => setDateRangeViewing(index)}>
        {text}
      </DropdownTab>
    );
  });
  if (!dateRanges.filter(range => !range.start.length && !range.end.length).size) {
    tabs = tabs.push(<DropdownTab key={-1} onClick={onAddRange}>Add New</DropdownTab>);
  }
  return <TabsContainer>{tabs}</TabsContainer>;
};

const DateRangeSelection = ({ dateRanges, dateRangeViewing, onDateRangeChange } :Props) => {
  const selectedDateRange = dateRanges.get(dateRangeViewing);
  const { start, end } = selectedDateRange;

  const onChange = (key, valueStr) => {
    const valueMoment = moment(valueStr);
    const value = valueMoment.isValid() ? valueMoment.format(DATE_FORMAT) : '';
    const newValue = Object.assign({}, selectedDateRange, { [key]: value });
    onDateRangeChange(dateRanges.set(dateRangeViewing, newValue));
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
};

const getDateProperties = (selectedNeighborTypes, entityTypesById, propertyTypesById) => {
  let dateProperties = OrderedSet();
  let entityTypeIds = OrderedSet();
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
};

const DatePropertySelection = ({
  dateRanges,
  dateRangeViewing,
  onDateRangeChange,
  selectedNeighborTypes,
  entityTypesById,
  propertyTypesById
} :Props) => {

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
    onDateRangeChange(dateRanges.set(dateRangeViewing, updatedDateRange));
  };

  const getDatePropertyLabel = (pair) => {
    const entityTypeTitle = entityTypesById.getIn([pair.get(0), 'title'], '');
    const propertyTypeTitle = propertyTypesById.getIn([pair.get(1), 'title'], '');
    return `${propertyTypeTitle} of ${entityTypeTitle}`;
  };

  const checkboxes = getDateProperties(selectedNeighborTypes, entityTypesById, propertyTypesById).map(datePair => (
    <SingleCheckboxWrapper key={datePair}>
      <StyledCheckbox
          label={getDatePropertyLabel(datePair)}
          checked={properties.has(datePair)}
          disabled={reserved.has(datePair)}
          onChange={e => onChange(e, datePair)} />
    </SingleCheckboxWrapper>
  ));

  return (
    <PropertyCheckboxWrapper>
      {checkboxes}
    </PropertyCheckboxWrapper>
  );
};

const MultiDateRangePicker = (props :Props) => (
  <DropdownWrapper>
    <SelectedRangesTab {...props} />
    <DateRangeSelection {...props} />
    <DatePropertySelection {...props} />
  </DropdownWrapper>
);

export default MultiDateRangePicker;
