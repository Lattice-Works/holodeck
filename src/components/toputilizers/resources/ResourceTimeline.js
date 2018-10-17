/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Map } from 'immutable';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import ChartWrapper from '../../charts/ChartWrapper';
import { RESOURCE_COLORS } from '../../../utils/constants/Colors';
import { CHART_EXPLANATIONS } from '../../../utils/constants/TopUtilizerConstants';

type Props = {
  countsByYearAndMonth :Map<*, *>,
  durationByYearAndMonth :Map<*, *>,
  timeUnit :string
};

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

const renderTimelineTooltip = ({ label, payload, timeUnit }) => {
  if (!payload || !payload.length) {
    return null;
  }

  const year = Math.floor(label);
  const month = Math.round((label - year) * 12) + 1;
  const dateStr = `${month}/${year}`;
  const date = moment(dateStr, 'M/YYYY');
  const formattedDate = date.isValid() ? date.format('MMM YYYY') : dateStr;

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
};

const ResourceTimeline = ({
  countsByYearAndMonth,
  durationByYearAndMonth,
  timeUnit
} :Props) => {
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
        yLabelRight={timeUnit.length ? timeUnit : undefined}
        noMargin
        infoText={CHART_EXPLANATIONS.RESOURCE_TIMELINE}>
      <LineChart width={840} height={250} data={data}>
        <YAxis yAxisId="left" orientation="left" type="number" tickLine={false} />
        {timeUnit.length ? <YAxis yAxisId="right" orientation="right" type="number" tickLine={false} /> : null}
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
            content={({ label, payload }) => renderTimelineTooltip({ label, payload, timeUnit })} />
        <Line
            dataKey="count"
            yAxisId="left"
            dot={false}
            strokeWidth={2}
            type="linear"
            stroke={RESOURCE_COLORS.EVENTS[1]} />
        {
          durationByYearAndMonth.size && timeUnit.length ? (
            <Line
                dataKey="duration"
                yAxisId="right"
                dot={false}
                strokeWidth={2}
                type="linear"
                stroke={RESOURCE_COLORS.DURATION[1]} />
          ) : null
        }
      </LineChart>
    </ChartWrapper>
  );
};

export default ResourceTimeline;
