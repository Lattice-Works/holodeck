/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import Select, { components } from 'react-select';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import {
  LineChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  ComposedChart,
  Tooltip
} from 'recharts';

import LoadingSpinner from '../LoadingSpinner';
import getTitle from '../../utils/EntityTitleUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import {
  CenteredColumnContainer,
  FixedWidthWrapper,
  LoadingText,
  TitleText
} from '../layout/Layout';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';
import { getEntityDates } from '../../utils/EntityDateUtils';

type Props = {
  results :List<*>,
  entityTypesById :Map<string, *>,
  neighborsById :Map<string, *>,
  selectedEntityType :Map<string, *>,
  detailedCounts :Map<string, *>,
  isLoading :boolean,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>
};

type State = {
  processedDates :Map<*, *>,
  processedDurations :Map<*, *>,
  SELECTED_UTILIZER :{},
  SELECTED_TYPE :{}
};

const SimpleWrapper = styled.div`
  flex-shrink: 1;
  width: 100%;
  height: 532px;
  padding: 30px;
`;

const WideSplitCard = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: 5px;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;

  ${SimpleWrapper}:first-child {
    border-right: 1px solid #e1e1eb;
  }
`;

const Option = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 20px;
  background-color: transparent;
  color: #555e6f;
  font-family: 'Open Sans';
  font-size: 14px;
  margin-bottom: ${props => (props.selected ? 0 : '10px')};

  &:hover {
    background-color: ${props => (props.selected ? 'transparent' : '#f0f0f7')};
    cursor: pointer;
  }

  span {
    width: 30px;
    text-align: left;
    font-weight: 600;
  }
`;

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 30px;
`;

const SelectLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #555e6f;
  margin-bottom: 10px;
`;

const WideSelect = styled(Select)`
  width: 100%;
`;

const FILTERS = {
  SELECTED_UTILIZER: 'SELECTED_UTILIZER',
  SELECTED_TYPE: 'SELECTED_TYPE'
};

const BLANK_OPTION = fromJS({
  value: '',
  label: 'All'
});

const MONTH_FORMAT = 'MMM YYYY';

export default class TopUtilizerResouces extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      [FILTERS.SELECTED_UTILIZER]: BLANK_OPTION.toJS(),
      [FILTERS.SELECTED_TYPE]: BLANK_OPTION.toJS(),
      processedDates: Map(),
      processedDurations: Map()
    };
  }

  componentDidMount() {
    this.preprocess(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { neighborsById } = this.props;
    if (nextProps.neighborsById.size !== neighborsById.size) {
      this.preprocess(nextProps);
    }
  }

  getBlankMap = (pairs) => {
    let map = Map();
    pairs.forEach((pair) => {
      const value = Map();
      map = map.set(pair, value);
    });

    return map;
  }

  getTypesWithDuration = (allPairs, entityTypesById, propertyTypesById) => {
    let ids = Set();

    allPairs.forEach((pair) => {
      const id = pair.get(1);
      entityTypesById.getIn([id, 'properties']).forEach((propertyTypeId) => {
        if (getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'])) === PROPERTY_TYPES.DURATION) {
          ids = ids.add(id);
        }
      });
    });

    return ids;
  }

  preprocess = (props :Props) => {
    const {
      detailedCounts,
      entityTypesById,
      neighborsById,
      propertyTypesById,
      results
    } = props;

    if (!detailedCounts.size) {
      return;
    }

    const allPairsMap = detailedCounts.first();
    const blankMap = this.getBlankMap(allPairsMap.keySeq());
    const durationTypes = this.getTypesWithDuration(allPairsMap.keySeq(), entityTypesById, propertyTypesById);

    let processedDates = Map();
    let processedDurations = Map();

    results.forEach((utilizer) => {
      const id = getEntityKeyId(utilizer);
      let dateMap = blankMap;
      let durationMap = blankMap;

      neighborsById.get(id, List()).forEach((neighbor) => {
        const assocId = neighbor.getIn(['associationEntitySet', 'entityTypeId']);
        const neighborId = neighbor.getIn(['neighborEntitySet', 'entityTypeId']);

        if (assocId && neighborId) {
          const pair = List.of(assocId, neighborId);

          if (allPairsMap.has(pair)) {
            const neighborDetails = neighbor.get('neighborDetails', Map());

            /* Deal with dates */
            [
              ...getEntityDates(entityTypesById.get(assocId, Map()), neighbor.get('associationDetails')),
              ...getEntityDates(entityTypesById.get(neighborId, Map()), neighborDetails),
            ].forEach((date) => {
              const dateStr = date.format(MONTH_FORMAT);
              dateMap = dateMap.setIn([pair, dateStr], dateMap.getIn([pair, dateStr], 0) + 1);
            });

            /* Deal with durations */
            if (durationTypes.has(pair.get(1))) {
              const startDateTime = moment(neighborDetails.getIn([PROPERTY_TYPES.DATETIME_ALERTED, 0], ''));
              if (startDateTime.isValid()) {
                const dt = startDateTime.format(MONTH_FORMAT);
                const duration = Number.parseInt(neighborDetails.getIn([PROPERTY_TYPES.DURATION, 0]), 10);
                if (!Number.isNaN(duration)) {
                  durationMap = durationMap.setIn([pair, dt], durationMap.getIn([pair, dt], 0) + duration);
                }
              }

            }

          }
        }

      });

      processedDates = processedDates.set(id, dateMap);
      processedDurations = processedDurations.set(id, durationMap);
    });

    this.setState({ processedDates, processedDurations });
  }

  renderOption = (data, selected, onClick, withNum) => (
    <Option selected={selected} onClick={onClick ? onClick : () => {}}>
      {data.num > 0 ? <span>{data.num}</span> : null}
      <div>{data.label}</div>
    </Option>
  );

  renderSelectOption = (props) => {
    const { setValue, data } = props;
    return this.renderOption(data, false, () => setValue(data), !!data.num);
  }

  renderSingleValue = (props) => {
    const { data } = props;

    return (
      <components.SingleValue {...props}>
        {this.renderOption(data, true, null, !!data.num)}
      </components.SingleValue>
    );
  }

  renderSelectDropdown = (key, label, options) => {
    const value = this.state[key];

    const onChange = (newValue) => {
      this.setState({ [key]: newValue });
    };

    return (
      <SelectWrapper>
        <SelectLabel>{label}</SelectLabel>
        <WideSelect
            value={value}
            onChange={onChange}
            options={options}
            placeholder="Select"
            isClearable={false}
            components={{
              Option: this.renderSelectOption,
              SingleValue: this.renderSingleValue
            }}
            styles={{
              container: base => ({
                ...base,
                outline: 'none',
                border: '0'
              })
            }} />
      </SelectWrapper>
    );
  }

  getCountsByYear = () => {
    const { processedDates } = this.state;

    // pair -> year -> count
    let countsByYear = Map();

    const updateCounts = (countsMap) => {
      countsMap.entrySeq().forEach(([pair, datesMap]) => {
        datesMap.entrySeq().forEach(([date, count]) => {
          const year = Number.parseInt(date.slice(-4), 10);
          if (!Number.isNaN(year)) {
            countsByYear = countsByYear.setIn([pair, year], countsByYear.getIn([pair, year], 0) + count);
          }
        });
      });
    };

    if (this.state[FILTERS.SELECTED_UTILIZER].value.length) {
      updateCounts(processedDates.get(this.state[FILTERS.SELECTED_UTILIZER].value));
    }
    else {
      processedDates.valueSeq().forEach(countsMap => updateCounts(countsMap));
    }

    return countsByYear;
  }

  renderEventCountChart = () => {
    const pairYearCounts = this.getCountsByYear();
    let countsByYear = Map();

    const updateCountsByYear = (pair) => {
      pairYearCounts.get(pair, Map()).entrySeq().forEach(([year, count]) => {
        countsByYear = countsByYear.set(year, countsByYear.get(year, 0) + count);
      });
    }

    if (this.state[FILTERS.SELECTED_TYPE].value.size) {
      updateCountsByYear(this.state[FILTERS.SELECTED_TYPE].value);
    }
    else {
      pairYearCounts.keySeq().forEach(pair => updateCountsByYear(pair));
    }
    const data = countsByYear.entrySeq().map(([year, count]) => ({ year, count }));

    return (
      <BarChart width={400} height={400} data={data.toJS()}>
        <YAxis type="number" tickLine={false} />
        <XAxis type="number" tickLine={false} dataKey="year" domain={['dataMin', 'dataMax']} />
        <Tooltip />
        <Bar dataKey="count" fill="#ffc59e" />
      </BarChart>
    );
  }

  renderBasicSetup = () => {
    const {
      results,
      detailedCounts,
      entityTypesById,
      selectedEntityType
    } = this.props;

    const countMaps = detailedCounts.valueSeq();

    if (!countMaps.size) {
      return null;
    }

    const utilizerOptions = [
      BLANK_OPTION.toJS(),
      ...results.map((utilizer, index) => {
        const value = getEntityKeyId(utilizer);
        const num = index + 1;
        const label = getTitle(selectedEntityType, utilizer);
        return { value, num, label };
      }).toJS()
    ];

    const entityTypeOptions = [
      BLANK_OPTION.toJS(),
      ...countMaps.first().keySeq().map((pair) => {
        const entityTypeId = pair.get(1);
        const label = entityTypesById.getIn([entityTypeId, 'title']);
        return {
          value: pair,
          label
        };
      }).toArray()
    ];

    return (
      <WideSplitCard>
        <SimpleWrapper>
          <TitleText>Resources Setup</TitleText>
          {this.renderSelectDropdown(FILTERS.SELECTED_UTILIZER, selectedEntityType.get('title'), utilizerOptions)}
          {this.renderSelectDropdown(FILTERS.SELECTED_TYPE, 'Event Type', entityTypeOptions)}
        </SimpleWrapper>
        <SimpleWrapper>
          <TitleText>Event Count</TitleText>
          {this.renderEventCountChart()}
        </SimpleWrapper>
      </WideSplitCard>
    );
  }

  getContent = () => {
    const { isLoading } = this.props;

    if (isLoading) {
      return (
        <CenteredColumnContainer>
          <LoadingText>Loading resource data</LoadingText>
          <LoadingSpinner />
        </CenteredColumnContainer>
      );
    }

    return (
      <CenteredColumnContainer>
        {this.renderBasicSetup()}
      </CenteredColumnContainer>
    );
  }

  render() {
    return (
      <CenteredColumnContainer>
        <FixedWidthWrapper>
          {this.getContent()}
        </FixedWidthWrapper>
      </CenteredColumnContainer>
    );
  }
}
