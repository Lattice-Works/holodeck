/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import LoadingSpinner from '../LoadingSpinner';
import ChartWrapper from '../charts/ChartWrapper';
import ChartTooltip from '../charts/ChartTooltip';
import { CHART_EXPLANATIONS } from '../../utils/constants/TopUtilizerConstants';
import { CHART_COLORS } from '../../utils/constants/Colors';
import { FixedWidthWrapper } from '../layout/Layout';
import { getEntityKeyId } from '../../utils/DataUtils';

type Props = {
  results :List<*>,
  selectedEntityType :Map<*, *>,
  entityTypesById :Map<string, *>,
  detailedCounts :Map<string, *>,
  isLoading :boolean
};

type State = {
  eventCounts :Map<*, number>,
  eventColors :Map<*, string>
}

const ResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const TitleText = styled.h1`
  font-family: 'Open Sans', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #2e2e34;
`;

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

export default class TopUtilizerDashboard extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      eventCounts: this.getEventCounts(props),
      eventColors: this.getEventColors(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    const { detailedCounts } = this.props;
    if (nextProps.detailedCounts !== detailedCounts) {
      this.setState({
        eventCounts: this.getEventCounts(nextProps),
        eventColors: this.getEventColors(nextProps)
      });
    }
  }

  getEventCounts = (props :Props) => {
    const { detailedCounts } = props;
    const countValues = detailedCounts.valueSeq();
    let eventCounts = Map();

    if (countValues.size) {
      const allPairs = countValues.first().keySeq();

      countValues.forEach((counts) => {
        allPairs.forEach((pair) => {
          if (counts.get(pair, 0) > 0) {
            eventCounts = eventCounts.set(pair, eventCounts.get(pair, 0) + 1);
          }
        });
      });
    }

    return eventCounts;
  }

  getEventColors = (props :Props) => {
    const { detailedCounts } = props;
    const countValues = detailedCounts.valueSeq();
    let eventColors = Map();

    if (countValues.size) {
      const allPairs = countValues.first().keySeq();
      allPairs.forEach((pair, index) => {
        eventColors = eventColors.set(pair, CHART_COLORS[index % CHART_COLORS.length]);
      });
    }

    return eventColors;
  }

  renderCountCards = () => {
    const { detailedCounts, entityTypesById, selectedEntityType } = this.props;
    const { eventCounts } = this.state;

    if (!detailedCounts.size) return null;

    let entityTypeTitle = selectedEntityType.get('title');
    if (entityTypeTitle === 'Person') {
      entityTypeTitle = 'People';
    }

    const numWithAll = detailedCounts
      .valueSeq()
      .filter(counts => (counts.valueSeq().filter(count => count === 0).cacheResult().size === 0))
      .cacheResult()
      .size;

    return (
      <CountCardRow>
        <CountCard>
          <h1>{numWithAll}</h1>
          <span>{entityTypeTitle}</span>
          <span>with all event types</span>
        </CountCard>
        {detailedCounts.valueSeq().first().keySeq().map(pair => (
          <CountCard key={pair}>
            <h1>{eventCounts.get(pair)}</h1>
            <span>{entityTypeTitle}</span>
            <span>{`with any ${entityTypesById.getIn([pair.get(1), 'title'])}`}</span>
          </CountCard>
        ))}
      </CountCardRow>
    );
  }

  renderTooltip = ({ label, payload }) => {
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
        {payload.map(point => (
          <TooltipRow key={point.name}>
            <Dot color={point.stroke} />
            <div>{`Num. of ${title}: ${point.value}`}</div>
          </TooltipRow>
        ))}
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
            <LegendRow color={color}>
              <span color={color} />
              <div>{title}</div>
            </LegendRow>
          );
        })}
      </LegendWrapper>
    );
  }

  renderEventsPerPerson = () => {
    const { detailedCounts, selectedEntityType, entityTypesById } = this.props;
    const { eventColors } = this.state;

    if (!detailedCounts.valueSeq().size) {
      return null;
    }

    let allCountsMap = Map();

    detailedCounts.valueSeq().forEach((countMap) => {
      countMap.entrySeq().forEach(([pair, count]) => {
        allCountsMap = allCountsMap.setIn([count, pair], allCountsMap.getIn([count, pair], 0) + 1);
      });
    });

    let eventTypeNames = Map();
    detailedCounts.valueSeq().first().keySeq().forEach((pair) => {
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
        <LineChart width={820} height={390} data={data.toJS()}>
          <XAxis type="number" dataKey="numEvents" tickLine={false} />
          <YAxis type="number" tickLine={false} />
          <Tooltip content={this.renderTooltip} />
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

  getContent = () => {
    const { isLoading } = this.props;

    if (isLoading) {
      return (
        <ResultsContainer>
          <TitleText>Loading dashboard data</TitleText>
          <LoadingSpinner />
        </ResultsContainer>
      );
    }

    return (
      <ResultsContainer>
        {this.renderCountCards()}
        {this.renderEventsPerPerson()}
      </ResultsContainer>
    );

  }

  render() {
    return (
      <ResultsContainer>
        <FixedWidthWrapper>
          {this.getContent()}
        </FixedWidthWrapper>
      </ResultsContainer>
    );
  }
}
