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
import ChartWrapper from '../charts/ChartWrapper';
import getTitle from '../../utils/EntityTitleUtils';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { CHART_EXPLANATIONS } from '../../utils/constants/TopUtilizerConstants';
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

const TimelineTooltipLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #8e929b;
  margin: 0 5px;
`;

const TimelineLineDescriptor = styled.div`
  font-family: 'Open Sans', sans-serif;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;

  div:first-child {
    width: 30px;
    height: 2px;
    margin-left: 40px;
    background-color: ${props => props.color};
  }

  div:last-child {
    color: #555e6f;
    font-size: 14px;
    font-weight: 600;
  }
`;

const TimelineTooltip = styled.div`
  position: absolute;
  top: -50px;
  right: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;
  height: 20px;
  visibility: visible;
`;

const FILTERS = {
  SELECTED_UTILIZER: 'SELECTED_UTILIZER',
  SELECTED_TYPE: 'SELECTED_TYPE'
};

const BLANK_OPTION = fromJS({
  value: '',
  label: 'All'
});

const MONTH_FORMAT = 'MM/YYYY';

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

  renderOption = (data, selected, onClick) => (
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

  getCountsByYearAndMonth = () => {
    const { processedDates } = this.state;

    /* pair -> year -> month -> count */
    let counts = Map();

    const updateCounts = (countsMap) => {
      countsMap.entrySeq().forEach(([pair, datesMap]) => {
        datesMap.entrySeq().forEach(([date, count]) => {
          const monthAndYear = date.split('/');
          const month = Number.parseInt(monthAndYear[0], 10);
          const year = Number.parseInt(monthAndYear[1], 10);
          if (!Number.isNaN(month) && !Number.isNaN(year)) {
            counts = counts.setIn([pair, year, month], counts.getIn([pair, year, month], 0) + count);
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

    return counts;
  }

  getFilteredCountsForType = (byMonth) => {
    /* either year -> count OR year -> month -> count (depending on byMonth) */
    const pairDateCounts = this.getCountsByYearAndMonth();
    let counts = Map();

    const updateCountsByDate = (pair) => {
      pairDateCounts.get(pair, Map()).entrySeq().forEach(([year, monthCount]) => {

        monthCount.entrySeq().forEach(([month, count]) => {
          if (byMonth) {
            counts = counts.setIn([year, month], counts.getIn([year, month], 0) + count);
          }
          else {
            counts = counts.set(year, counts.get(year, 0) + count);
          }
        });
      });
    };

    if (this.state[FILTERS.SELECTED_TYPE].value.size) {
      updateCountsByDate(this.state[FILTERS.SELECTED_TYPE].value);
    }
    else {
      pairDateCounts.keySeq().forEach(pair => updateCountsByDate(pair));
    }

    return counts;
  }

  renderEventCountChart = () => {
    const countsByYear = this.getFilteredCountsForType();

    const data = countsByYear.entrySeq().map(([year, count]) => ({ year, count }));
    const xAxisType = data.size > 1 ? 'number' : 'category';

    return (
      <BarChart width={400} height={400} data={[...data.toJS()]}>
        <YAxis type="number" tickLine={false} />
        <XAxis type={xAxisType} tickLine={false} dataKey="year" domain={['dataMin', 'dataMax']} />
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

  renderTimelineTooltip = ({ label, payload }) => {
    if (!payload || !payload.length) {
      return null;
    }

    const year = Math.floor(label);
    const month = Math.round((label - year) * 12) + 1;
    const dateStr = `${month}/${year}`;
    const date = moment(dateStr, 'M/YYYY');
    const formattedDate = date.isValid() ? date.format('MMM YYYY') : dateStr;

    let eventDescriptor;
    payload.forEach((payloadPoint) => {
      const { color } = payloadPoint;
      const { count } = payloadPoint.payload;
      if (count !== undefined) {
        eventDescriptor = (
          <TimelineLineDescriptor color={color}>
            <div color={color} />
            <TimelineTooltipLabel>Event count</TimelineTooltipLabel>
            <div>{count}</div>
          </TimelineLineDescriptor>
        );
      }
    });

    return (
      <TimelineTooltip>
        <TimelineTooltipLabel>{formattedDate}</TimelineTooltipLabel>
        {eventDescriptor}
      </TimelineTooltip>
    );
  }

  renderTimeline = () => {
    const countsByYearAndMonth = this.getFilteredCountsForType(true);

    const data = [];
    countsByYearAndMonth.entrySeq().forEach(([year, monthCounts]) => {
      monthCounts.entrySeq().forEach(([month, count]) => {
        const dt = year + ((month - 1) / 12);
        data.push({ dt, count });
      });
    });

    data.sort((d1, d2) => (d1.dt < d2.dt ? -1 : 1));

    let minYear = 0;
    let maxYear = 0;

    if (data.length > 0) {
      minYear = Math.floor(data[0].dt);
      maxYear = Math.ceil(data[data.length - 1].dt);
    }

    return (
      <ChartWrapper
          title="Timeline"
          yLabel="Count"
          noMargin
          infoText={CHART_EXPLANATIONS.RESOURCE_TIMELINE}>
        <LineChart width={840} height={250} data={data}>
          <YAxis type="number" tickLine={false} />
          <XAxis
              type="number"
              tickLine={false}
              allowDecimals={false}
              dataKey="dt"
              domain={[minYear, maxYear]} />
          <Tooltip
              wrapperStyle={{
                position: 'static',
                transform: 'none !important'
              }}
              content={this.renderTimelineTooltip} />
          <Line
              dataKey="count"
              dot={false}
              strokeWidth={2}
              type="linear"
              stroke="#ff9a58" />
        </LineChart>
      </ChartWrapper>
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
        {this.renderTimeline()}
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
