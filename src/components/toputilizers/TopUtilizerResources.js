/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import Select, { components } from 'react-select';
import Modal, { ModalTransition } from '@atlaskit/modal-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faTimes } from '@fortawesome/pro-solid-svg-icons';
import {
  fromJS,
  List,
  Map,
  Set,
  OrderedSet
} from 'immutable';
import {
  LineChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import LoadingSpinner from '../LoadingSpinner';
import ChartWrapper from '../charts/ChartWrapper';
import CostRateModal from './CostRateModal';
import UtilityButton from '../buttons/UtilityButton';
import getTitle from '../../utils/EntityTitleUtils';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { CHART_EXPLANATIONS, RESOURCE_TYPES, DEFAULT_COST_RATES } from '../../utils/constants/TopUtilizerConstants';
import {
  DURATION_TYPES,
  DURATION_DAY_TYPES,
  DURATION_HOUR_TYPES,
  DURATION_MINUTE_TYPES
} from '../../utils/constants/DataModelConstants';
import { RESOURCE_COLORS } from '../../utils/constants/Colors';
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
  countBreakdown :Map<string, *>,
  entityTypesById :Map<string, *>,
  neighborsById :Map<string, *>,
  selectedEntityType :Map<string, *>,
  isLoading :boolean,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>
};

type State = {
  processedDates :Map<*, *>,
  costRates :Map<List<string>, number>,
  isSettingCostRate :boolean,
  displayDefaultCostBanner :boolean,
  SELECTED_UTILIZER :{},
  SELECTED_TYPE :{}
};

const PaddedTitleText = styled(TitleText)`
  margin-bottom: 30px;
`;

const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ChartCard = styled.div`
  width: 49%;
`;

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

const BarChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
`;

const Subtitle = styled.div`
  display: block;
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #8e929b;
  margin: -20px 0 30px 0;

  span {
    color: #555e6f;
  }
`;

const CostRateButton = styled(UtilityButton)`
  position: absolute;
  top: 30px;
  right: 30px;
`;

const FloatingTooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  border-radius: 3px;
  box-shadow: 0 10px 20px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  border: solid 1px #e1e1eb;
  padding: 5px 15px;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #2e2e34;

  span {
    padding: 5px 0;
  }
`;

const NotificationBanner = styled.div`
  width: 100%;
  margin-top: 20px;
  padding: 15px 30px;
  border-radius: 5px;
  background-color: #555e6f;
  font-family: 'Open Sans';
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  line-height: normal;

  span {
    width: 812px;
  }

  button {
    border: none;
    cursor: pointer;
    background: transparent;
    color: #ffffff;
  }
`;

const FILTERS = {
  SELECTED_UTILIZER: 'SELECTED_UTILIZER',
  SELECTED_TYPE: 'SELECTED_TYPE'
};

const BLANK_OPTION = fromJS({
  value: '',
  label: 'All'
});

const MONTH_FORMAT = 'M/YYYY';

const TIME_UNIT = {
  MINUTES: 'Minutes',
  HOURS: 'Hours',
  DAYS: 'Days'
};

export default class TopUtilizerResouces extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      [FILTERS.SELECTED_UTILIZER]: BLANK_OPTION.toJS(),
      [FILTERS.SELECTED_TYPE]: BLANK_OPTION.toJS(),
      processedDates: Map(),
      costRates: Map(),
      isSettingCostRate: false,
      displayDefaultCostBanner: false,
      durationTypes: Map()
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

  getAllPairs = () => {
    const { countBreakdown } = this.props;

    if (!countBreakdown.size) {
      return OrderedSet();
    }

    return countBreakdown.first().keySeq().filter(key => key !== 'score').toOrderedSet();
  }

  getDurationTypes = () => {
    const { countBreakdown } = this.props;

    let durationTypes = Map();

    if (countBreakdown) {
      countBreakdown.first().entrySeq().filter(([pair]) => pair !== 'score').forEach(([pair, propertyTypeMap]) => {
        propertyTypeMap.keySeq().filter(ptId => ptId !== COUNT_FQN).forEach((ptId) => {
          durationTypes = durationTypes.set(pair, durationTypes.get(pair, OrderedSet()).add(ptId));
        });
      });
    }

    return durationTypes;
  }

  getTimeUnit = () => {
    const { propertyTypesById } = this.props;

    const durationTypes = this.getDurationTypes();
    if (!durationTypes.size) {
      return '';
    }

    const propertyTypeId = durationTypes.valueSeq().first().first();

    const fqn = getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'], Map()));

    if (DURATION_MINUTE_TYPES[fqn]) {
      return TIME_UNIT.MINUTES;
    }

    if (DURATION_HOUR_TYPES[fqn]) {
      return TIME_UNIT.HOURS;
    }

    if (DURATION_DAY_TYPES[fqn]) {
      return TIME_UNIT.DAYS;
    }

    return '';
  }

  getDefaultCostRate = (propertyTypeId) => {
    const { propertyTypesById } = this.props;
    const fqn = getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'], Map()));
    return DEFAULT_COST_RATES[fqn] || 0;
  }

  preprocess = (props :Props) => {
    const {
      countBreakdown,
      entityTypesById,
      neighborsById,
      propertyTypesById,
      results
    } = props;

    if (!countBreakdown.size) {
      return;
    }

    const allPairs = this.getAllPairs();
    const blankMap = this.getBlankMap(allPairs);
    const durationTypes = this.getDurationTypes();

    let costRates = Map();
    let processedDates = Map();
    let displayDefaultCostBanner = false;

    durationTypes.entrySeq().forEach(([pair, properties]) => {
      properties.forEach((propertyTypeId) => {
        const triplet = pair.push(propertyTypeId);
        const defaultCost = this.getDefaultCostRate(propertyTypeId);
        if (defaultCost > 0) {
          displayDefaultCostBanner = true;
        }
        costRates = costRates.set(triplet, this.state.costRates.get(triplet, defaultCost));
      });
    });

    results.forEach((utilizer) => {
      const id = getEntityKeyId(utilizer);
      let dateMap = blankMap;

      neighborsById.get(id, List()).forEach((neighbor) => {
        const assocId = neighbor.getIn(['associationEntitySet', 'entityTypeId']);
        const neighborId = neighbor.getIn(['neighborEntitySet', 'entityTypeId']);

        if (assocId && neighborId) {
          const pair = List.of(assocId, neighborId);

          if (allPairs.has(pair)) {
            const neighborDetails = neighbor.get('neighborDetails', Map());
            const associationDetails = neighbor.get('associationDetails', Map());

            /* Deal with dates */
            [
              ...getEntityDates(entityTypesById.get(assocId, Map()), associationDetails),
              ...getEntityDates(entityTypesById.get(neighborId, Map()), neighborDetails),
            ].forEach((date) => {
              const dateStr = date.format(MONTH_FORMAT);
              dateMap = dateMap.setIn([pair, dateStr], dateMap.getIn([pair, dateStr], 0) + 1);
            });

            /* Deal with durations */
            durationTypes.get(pair, Set()).forEach((propertyTypeId) => {
              const getValue = fqn => neighborDetails.getIn([fqn, 0], associationDetails.getIn([fqn, 0]));

              const durationFqn = getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'], Map()));
              const dateFqn = DURATION_TYPES[durationFqn];

              const startDateTime = moment(getValue(dateFqn));
              if (startDateTime.isValid()) {
                const dt = startDateTime.format(MONTH_FORMAT);
                const duration = Number.parseInt(getValue(durationFqn), 10);
                if (!Number.isNaN(duration)) {
                  const triplet = pair.push(propertyTypeId);
                  dateMap = dateMap.setIn([triplet, dt], dateMap.getIn([triplet, dt], 0) + duration);
                }
              }
            });
          }
        }

      });

      processedDates = processedDates.set(id, dateMap);
    });

    this.setState({
      costRates,
      displayDefaultCostBanner,
      durationTypes,
      processedDates
    });
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

  getCountsByYearAndMonth = (useCounts, withMultiplier) => {
    const { costRates, processedDates } = this.state;
    const processedValues = useCounts ? processedDates : processedDates; // HANDLE BY DURATION

    /* pair -> year -> month -> count */
    let counts = Map();

    const updateCounts = (countsMap) => {
      countsMap.entrySeq().forEach(([pair, datesMap]) => {
        datesMap.entrySeq().forEach(([date, count]) => {
          const monthAndYear = date.split('/');
          const month = Number.parseInt(monthAndYear[0], 10);
          const year = Number.parseInt(monthAndYear[1], 10);
          if (!Number.isNaN(month) && !Number.isNaN(year)) {
            const countValue = withMultiplier ? count * costRates.get(pair) : count;
            counts = counts.setIn([pair, year, month], counts.getIn([pair, year, month], 0) + countValue);
          }
        });
      });
    };

    const { value } = this.state[FILTERS.SELECTED_UTILIZER];
    if (value && value.length) {
      updateCounts(processedValues.get(value));
    }
    else {
      processedValues.valueSeq().forEach(countsMap => updateCounts(countsMap));
    }

    return counts;
  }

  getFilteredCountsForType = (useCounts, byMonth, withMultiplier) => {
    /* either year -> count OR year -> month -> count (depending on byMonth) */
    const pairDateCounts = this.getCountsByYearAndMonth(useCounts, withMultiplier);
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

    const { value } = this.state[FILTERS.SELECTED_TYPE];
    if (value && value.size) {
      const key = useCounts ? value.slice(0, 2) : value;
      updateCountsByDate(key);
    }
    else {
      pairDateCounts
        .keySeq()
        .filter(key => useCounts ? key.size === 2 : key.size === 3)
        .forEach(pair => updateCountsByDate(pair));
    }

    return counts;
  }

  formatCostNumber = num => Number.parseFloat(num).toFixed(2);

  formatTotalText = (total, resourceType, forTooltip) => {
    const timeUnit = this.getTimeUnit();
    switch (resourceType) {
      case RESOURCE_TYPES.DURATION:
        return forTooltip ? `${timeUnit}: ${total}` : `${total} ${timeUnit.toLowerCase()}`;

      case RESOURCE_TYPES.COST: {
        const costNum = `$${this.formatCostNumber(total)}`
        return forTooltip ? `Cost: ${costNum}` : costNum;
      }

      case RESOURCE_TYPES.EVENTS:
      default:
        return forTooltip ? `Event count: ${total}` : `${total}`;
    }
  }

  renderBarChartTooltip = (resourceType, { label, payload }) => {
    if (payload && payload.length) {
      const { value } = payload[0];

      return (
        <FloatingTooltipWrapper>
          <span>{`Year: ${label}`}</span>
          <span>{this.formatTotalText(value, resourceType, true)}</span>
        </FloatingTooltipWrapper>
      );
    }

    return null;
  }

  renderSimpleBarChart = (resourceType, byDates, withCostMultiplier) => {
    const colors = RESOURCE_COLORS[resourceType];
    const data = this.getFilteredCountsForType(byDates, false, withCostMultiplier)
      .entrySeq()
      .sort(([year1], [year2]) => year1 > year2 ? 1 : -1)
      .map(([year, count]) => ({ year, count }));

    const total = data.map(point => point.count).reduce((t1, t2) => t1 + t2) || 0;

    return (
      <BarChartWrapper>
        <Subtitle>Total: <span>{this.formatTotalText(total, resourceType)}</span></Subtitle>
        {withCostMultiplier
          ? <CostRateButton onClick={() => this.setState({ isSettingCostRate: true })}>Cost Rate</CostRateButton>
          : null
        }
        <BarChart width={400} height={400} data={data.toJS()}>
          <YAxis type="number" tickLine={false} />
          <XAxis type="category" tickLine={false} dataKey="year" domain={['dataMin', 'dataMax']} allowDecimals={false} />
          <Tooltip content={payloadData => this.renderBarChartTooltip(resourceType, payloadData)} />
          <Bar dataKey="count" fill={colors[0]} />
        </BarChart>
      </BarChartWrapper>
    );
  }

  getEventTypeOptions = () => {
    const { entityTypesById, propertyTypesById } = this.props;
    const { durationTypes } = this.state;
    if (!durationTypes.size) {
      return [
        BLANK_OPTION.toJS(),
        ...this.getAllPairs().map((pair) => {
          const entityTypeId = pair.get(1);
          const label = entityTypesById.getIn([entityTypeId, 'title']);
          return {
            value: pair,
            label
          };
        }).toArray()
      ];
    }

    return [
      BLANK_OPTION.toJS(),
      ...durationTypes.entrySeq().flatMap(([pair, properties]) => {
        const prefix = `${entityTypesById.getIn([pair.get(0), 'title'])} ${entityTypesById.getIn([pair.get(1), 'title'])}`;
        return properties.map((propertyTypeId) => {
          const label = `${prefix} -- ${propertyTypesById.getIn([propertyTypeId, 'title'], '')}`;
          const value = pair.push(propertyTypeId);
          return { label, value };
        });
      }).toArray()
    ];
  }

  renderBasicSetup = () => {
    const {
      results,
      selectedEntityType
    } = this.props;

    const allPairs = this.getAllPairs();

    if (!allPairs.size) {
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

    return (
      <WideSplitCard>
        <SimpleWrapper>
          <PaddedTitleText>Resources Option</PaddedTitleText>
          {this.renderSelectDropdown(FILTERS.SELECTED_UTILIZER, selectedEntityType.get('title'), utilizerOptions)}
          {this.renderSelectDropdown(FILTERS.SELECTED_TYPE, 'Event Type', this.getEventTypeOptions())}
        </SimpleWrapper>
        <SimpleWrapper>
          <PaddedTitleText>Event Count</PaddedTitleText>
          {this.renderSimpleBarChart(RESOURCE_TYPES.EVENTS, true)}
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
    const timeUnit = this.getTimeUnit();

    let eventDescriptor;
    let durationDescriptor;
    payload.forEach((payloadPoint) => {
      const { color } = payloadPoint;
      const { count, duration } = payloadPoint.payload;
      if (count !== undefined) {
        eventDescriptor = (
          <TimelineLineDescriptor color={RESOURCE_COLORS.EVENTS[1]}>
            <div color={color} />
            <TimelineTooltipLabel>Event count</TimelineTooltipLabel>
            <div>{count}</div>
          </TimelineLineDescriptor>
        );
      }

      if (timeUnit && duration !== undefined) {
        durationDescriptor = (
          <TimelineLineDescriptor color={RESOURCE_COLORS.DURATION[1]}>
            <div color={color} />
            <TimelineTooltipLabel>{timeUnit}</TimelineTooltipLabel>
            <div>{duration}</div>
          </TimelineLineDescriptor>
        );
      }
    });

    return (
      <TimelineTooltip>
        <TimelineTooltipLabel>{formattedDate}</TimelineTooltipLabel>
        {eventDescriptor}
        {durationDescriptor}
      </TimelineTooltip>
    );
  }

  renderDefaultCostBanner = () => {
    const { displayDefaultCostBanner } = this.state;
    if (!displayDefaultCostBanner) {
      return null;
    }

    return (
      <NotificationBanner>
        <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
        <span>Default costs shown are based on rough estimates or national averages. See Cost Rate for more details, and set custom cost rates to get more accurate results.</span>
        <button onClick={() => this.setState({ displayDefaultCostBanner: false })}>
          <FontAwesomeIcon icon={faTimes} size="2x" />
        </button>
      </NotificationBanner>
    )
  }

  renderTimeline = () => {
    const countsByYearAndMonth = this.getFilteredCountsForType(true, true);
    const durationByYearAndMonth = this.getFilteredCountsForType(false, true);

    const data = [];

    let counts = Map();
    countsByYearAndMonth.entrySeq().forEach(([year, monthCounts]) => {
      monthCounts.entrySeq().forEach(([month, count]) => {
        counts = counts.setIn([year, month, 'count'], count);
      });
    });
    durationByYearAndMonth.entrySeq().forEach(([year, monthCounts]) => {
      monthCounts.entrySeq().forEach(([month, duration]) => {
        counts = counts.setIn([year, month, 'duration'], duration);
      });
    });

    counts.entrySeq().forEach(([year, monthCounts]) => {
      monthCounts.entrySeq().forEach(([month, map]) => {
        const count = map.get('count', 0);
        const duration = map.get('duration');
        const dt = year + ((month - 1) / 12);
        data.push({ dt, count, duration });
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
              stroke={RESOURCE_COLORS.EVENTS[1]} />
          {
            durationByYearAndMonth.size ? (
              <Line
                  dataKey="duration"
                  dot={false}
                  strokeWidth={2}
                  type="linear"
                  stroke={RESOURCE_COLORS.DURATION[1]} />
            ) : null
          }
        </LineChart>
      </ChartWrapper>
    );
  }

  renderDurationAndCost = () => {
    const { durationTypes } = this.state;
    if (!durationTypes.size) {
      return null;
    }

    return (
      <RowWrapper>
        <ChartCard>
          <ChartWrapper title={this.getTimeUnit()}>
            {this.renderSimpleBarChart(RESOURCE_TYPES.DURATION, false)}
          </ChartWrapper>
        </ChartCard>
        <ChartCard>
          <ChartWrapper title="Cost">
            {this.renderSimpleBarChart(RESOURCE_TYPES.COST, false, true)}
          </ChartWrapper>
        </ChartCard>
      </RowWrapper>
    );
  }

  renderCostRateModal = () => {
    const { entityTypesById, propertyTypesById } = this.props;
    const { isSettingCostRate, costRates } = this.state;

    const onClose = () => this.setState({ isSettingCostRate: false });
    const onSetCostRate = newCostRates => this.setState({ costRates: newCostRates });
    return (
      <ModalTransition>
        {isSettingCostRate && (
          <Modal onClose={onClose}>
            <CostRateModal
                costRates={costRates}
                timeUnit={this.getTimeUnit()}
                entityTypesById={entityTypesById}
                propertyTypesById={propertyTypesById}
                onClose={onClose}
                onSetCostRate={onSetCostRate} />
          </Modal>
        )}
      </ModalTransition>
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
        {this.renderDefaultCostBanner()}
        {this.renderDurationAndCost()}
        {this.renderTimeline()}
        {this.renderCostRateModal()}
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
