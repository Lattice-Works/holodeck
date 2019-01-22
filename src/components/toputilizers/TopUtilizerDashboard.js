/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, Seq } from 'immutable';
import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  ComposedChart,
  Tooltip
} from 'recharts';

import LoadingSpinner from '../loading/LoadingSpinner';
import ChartWrapper from '../charts/ChartWrapper';
import ChartTooltip from '../charts/ChartTooltip';
import TopUtilizerPieCharts from './resources/TopUtilizerPieCharts';
import TopUtilizerParetoChart from './resources/TopUtilizerParetoChart';
import { CHART_EXPLANATIONS, PARETO_LABELS } from '../../utils/constants/TopUtilizerConstants';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { CHART_COLORS } from '../../utils/constants/Colors';
import { CenteredColumnContainer, FixedWidthWrapper, LoadingText } from '../layout/Layout';

type Props = {
  selectedEntitySet :Map<*, *>,
  selectedEntityType :Map<*, *>,
  entityTypesById :Map<string, *>,
  propertyTypesById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  countBreakdown :Map<string, *>,
  neighborsById :Map<string, *>,
  results :List<*>,
};

type State = {
  eventCounts :Map<*, number>,
  eventColors :Map<*, string>
}

const CountCardRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;

`;

const CountCard = styled.div`
  height: 150px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;
  padding: 30px 0;
  font-family: 'Open Sans', sans-serif;

  &:not(:last-child) {
    margin-right: 20px;
  }

  h1 {
    font-size: 40px;
    color: #2e2e34;
    margin-bottom: 20px;
    font-weight: normal;
    margin: 0 0 10px 0;
  }

  span {
    font-size: 16px;
    font-weight: 600;
    color: #555e6f;
    text-transform: capitalize;
  }

  span:last-child {
    font-size: 13px;
    font-weight: 600;
    color: #8e929b;
    padding: 5px;
    text-align: center;
    text-transform: lowercase;
  }
`;

const TooltipRow = styled.div`
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const Dot = styled.div`
  background-color: ${props => props.color};
  height: 5px;
  width: 5px;
  border-radius: 50%;
  margin-right: 5px;
`;

const LegendWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  position: absolute;
  top: 75px;
  right: 30px;
`;

const LegendRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  height: 20px;
  margin-bottom: 10px;

  span {
    width: 30px;
    height: 2px;
    background-color: ${props => props.color};
    margin-right: 10px;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #8e929b;
  }
`;

const SCORE = 'score';

export default class TopUtilizerDashboard extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      eventCounts: this.getEventCounts(props),
      eventColors: this.getEventColors(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { countBreakdown } = this.props;
    if (nextProps.countBreakdown !== countBreakdown) {
      this.setState({
        eventCounts: this.getEventCounts(nextProps),
        eventColors: this.getEventColors(nextProps)
      });
    }
  }

  getAllPairs = () => {
    const { countBreakdown } = this.props;
    return countBreakdown.size
      ? countBreakdown.valueSeq().first().keySeq().filter(key => key !== SCORE)
      : Seq();
  }

  getEventCounts = (props :Props) => {
    const { countBreakdown } = props;
    const countMaps = countBreakdown.valueSeq();
    let eventCounts = Map();

    if (countMaps.size) {
      const allPairs = this.getAllPairs();

      countMaps.forEach((counts) => {
        allPairs.forEach((pair) => {
          if (counts.getIn([pair, COUNT_FQN], 0) > 0) {
            eventCounts = eventCounts.set(pair, eventCounts.get(pair, 0) + 1);
          }
        });
      });
    }

    return eventCounts;
  }

  getEventColors = (props :Props) => {
    const { countBreakdown } = props;
    let eventColors = Map();

    if (countBreakdown.size) {
      const allPairs = this.getAllPairs()
      allPairs.forEach((pair, index) => {
        eventColors = eventColors.set(pair, CHART_COLORS[index % CHART_COLORS.length]);
      });
    }

    return eventColors;
  }

  renderCountCards = () => {
    const { entityTypesById, selectedEntityType, countBreakdown } = this.props;
    const { eventCounts } = this.state;
    if (!countBreakdown.size) return null;

    let entityTypeTitle = selectedEntityType.get('title');
    if (entityTypeTitle === 'Person') {
      entityTypeTitle = 'People';
    }

    const numWithAll = countBreakdown
      .valueSeq()
      .filter(pairCountMap => pairCountMap.entrySeq().filter(([key, countMap]) => {
        if (key === SCORE) return false;
        return !countMap.get(COUNT_FQN, 0);
      }).cacheResult().size === 0)
      .cacheResult()
      .size;

    return (
      <CountCardRow>
        <CountCard>
          <h1>{numWithAll}</h1>
          <span>{entityTypeTitle}</span>
          <span>with all event types</span>
        </CountCard>
        {countBreakdown.valueSeq().first().keySeq().filter(key => key !== SCORE).map(pair => (
          <CountCard key={pair}>
            <h1>{eventCounts.get(pair)}</h1>
            <span>{entityTypeTitle}</span>
            <span>{`with any ${entityTypesById.getIn([pair.get(1), 'title'])}`}</span>
          </CountCard>
        ))}
      </CountCardRow>
    );
  }

  renderEventBreakdownTooltip = ({ label, payload }) => {
    const { selectedEntityType } = this.props;
    let title = selectedEntityType.get('title', '').toLowerCase();
    if (title === 'person') {
      title = 'people';
    }

    return (
      <ChartTooltip>
        <TooltipRow>
          <Dot color="#8e929b" />
          <div>{`Num events: ${label}`}</div>
        </TooltipRow>
        {(payload && payload.length) ? payload.map(point => (
          <TooltipRow key={point.name}>
            <Dot color={point.stroke} />
            <div>{`Num. of ${title}: ${point.value}`}</div>
          </TooltipRow>
        )) : null}
      </ChartTooltip>
    );
  }

  renderLegend = () => {
    const { entityTypesById } = this.props;
    const { eventColors } = this.state;

    return (
      <LegendWrapper>
        {eventColors.entrySeq().map(([pair, color]) => {
          const title = entityTypesById.getIn([pair.get(1), 'title']);
          return (
            <LegendRow color={color} key={pair}>
              <span color={color} />
              <div>{title}</div>
            </LegendRow>
          );
        })}
      </LegendWrapper>
    );
  }

  renderEventsPerPerson = () => {
    const { countBreakdown, selectedEntityType, entityTypesById } = this.props;
    const { eventColors } = this.state;

    if (!countBreakdown.size) {
      return null;
    }

    let allCountsMap = Map();

    countBreakdown.valueSeq().forEach((countMap) => {
      countMap.entrySeq().filter(([key]) => key !== SCORE).forEach(([pair, ptCountMap]) => {
        const count = ptCountMap.get(COUNT_FQN, 0);
        allCountsMap = allCountsMap.setIn([count, pair], allCountsMap.getIn([count, pair], 0) + 1);
      });
    });

    let eventTypeNames = Map();
    this.getAllPairs().forEach((pair) => {
      eventTypeNames = eventTypeNames.set(pair, `Num. of ${entityTypesById.getIn([pair.get(1), 'title'])}`);
    });

    const data = allCountsMap.keySeq().sort().map((numEvents) => {
      let result = Map().set('numEvents', numEvents);

      allCountsMap.get(numEvents).entrySeq().forEach(([pair, numPeople]) => {
        result = result.set(eventTypeNames.get(pair), numPeople);
      });
      return result;
    });

    return (
      <ChartWrapper
          title={`Events per ${selectedEntityType.get('title')}`}
          yLabel="Number of People"
          xLabel="Number of Events"
          infoText={CHART_EXPLANATIONS.EVENTS_PER_PERSON}>
        {this.renderLegend()}
        <LineChart width={840} height={390} data={data.toJS()}>
          <XAxis type="number" dataKey="numEvents" tickLine={false} />
          <YAxis type="number" tickLine={false} />
          <Tooltip content={this.renderEventBreakdownTooltip} />
          {
            eventColors.entrySeq().map(([pair, color]) => (
              <Line
                  key={eventTypeNames.get(pair)}
                  type="linear"
                  dot={false}
                  dataKey={eventTypeNames.get(pair)}
                  stroke={color}
                  strokeWidth={2}
                  connectNulls />
            )).toJS()
          }
        </LineChart>
      </ChartWrapper>
    );

  }

  renderParetoChart = (pair, color) => {
    const { entityTypesById, countBreakdown } = this.props;
    const entityTypeTitle = entityTypesById.getIn([pair.get(1), 'title']);

    return (
      <TopUtilizerParetoChart
          key={pair}
          entityTypeTitle={entityTypeTitle}
          countBreakdown={countBreakdown}
          color={color}
          pair={pair} />
    );
  }

  renderParetoCharts = () => {
    const { eventColors } = this.state;
    return eventColors.entrySeq().map(([pair, color]) => this.renderParetoChart(pair, color));
  }

  render() {
    return (
      <CenteredColumnContainer>
        <FixedWidthWrapper>
          <CenteredColumnContainer>
            {this.renderCountCards()}
            {this.renderEventsPerPerson()}
            {this.renderParetoCharts()}
            <TopUtilizerPieCharts {...this.props} />
          </CenteredColumnContainer>
        </FixedWidthWrapper>
      </CenteredColumnContainer>
    );
  }
}
