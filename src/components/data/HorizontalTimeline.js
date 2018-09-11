/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List } from 'immutable';

const TimelineWrapper = styled.div`
  width: 100%;
  height: 110px;
  padding: 20px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 5px;
  border: 1px solid #e1e1eb;
`;

const DateRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #8e929b;
`;

const TimelineBackground = styled.div`
  width: 100%;
  height: 40px;
  background-color: #f0f0f7;
  border-radius: 3px;
  position: relative;
`;

const TimelineEvent = styled.span.attrs({
  style: ({ offset, colors }) => ({
    left: `${offset}%`,
    backgroundColor: colors.PRIMARY
  })
})`
  position: absolute;
  height: 100%;
  width: 2px;
`;

type Props = {
  datesToRender :List<*>,
  dateTypeColors :Map<List<string>, {
    PRIMARY :string,
    SECONDARY :string
  }>
};

const HorizontalTimeline = ({ datesToRender, dateTypeColors } :Props) => {

  const range = [0, 0];
  let shouldRenderRange = false;
  if (datesToRender.size) {
    range[0] = datesToRender.get(-1).date;
    range[1] = datesToRender.get(0).date;
    shouldRenderRange = true;
  }

  const spread = range[1].valueOf() - range[0].valueOf();


  const getTimelineEventWithOffset = (dateEntry, index) => {
    const { date, neighbor } = dateEntry;
    const offset = (date.valueOf() - range[0].valueOf()) / spread;
    const colors = dateTypeColors.get(List.of(
      neighbor.getIn(['associationEntitySet', 'id']),
      neighbor.getIn(['neighborEntitySet', 'id'])
    ), {});

    return <TimelineEvent key={index} offset={offset * 100} colors={colors} />;
  };

  return (
    <TimelineWrapper>
      <DateRow>
        <span>{shouldRenderRange ? range[0].format('MM/YYYY') : null}</span>
        <span>{shouldRenderRange ? range[1].format('MM/YYYY') : null}</span>
      </DateRow>
      <TimelineBackground>
        {datesToRender.map((getTimelineEventWithOffset))}
      </TimelineBackground>
    </TimelineWrapper>
  );
};

export default HorizontalTimeline;
