/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

import UtilityButton from '../../buttons/UtilityButton';
import { RESOURCE_TYPES } from '../../../utils/constants/TopUtilizerConstants';
import { RESOURCE_COLORS } from '../../../utils/constants/Colors';

type Props = {
  resourceType :string,
  withCostMultiplier :boolean,
  countsMap :Map<*, *>,
  setCostRate :() => void,
  timeUnit :string
};

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

const formatNumber = (num) => {
  if (num === undefined) return num;

  const val = Number.parseFloat(num);
  if (!Number.isNaN(val)) {
    return val.toLocaleString();
  }

  return num;
};

const formatCostNumber = (num) => {
  let parsedNum = formatNumber(num);
  if (parsedNum.length > 1) {
    if (parsedNum.endsWith('.')) {
      parsedNum = `${parsedNum}00`;
    }
    if (parsedNum[parsedNum.length - 2] === '.') {
      parsedNum = `${parsedNum}0`;
    }
  }

  return parsedNum;
};

const formatTotalText = (total, resourceType, timeUnit, forTooltip) => {
  const num = formatNumber(total);

  switch (resourceType) {
    case RESOURCE_TYPES.DURATION:
      return forTooltip ? `${timeUnit}: ${num}` : `${num} ${timeUnit.toLowerCase()}`;

    case RESOURCE_TYPES.COST: {
      const costNum = `$${formatCostNumber(total)}`;
      return forTooltip ? `Cost: ${costNum}` : costNum;
    }

    case RESOURCE_TYPES.EVENTS:
    default:
      return forTooltip ? `Event count: ${num}` : `${num}`;
  }
};

const renderBarChartTooltip = (resourceType, timeUnit, { label, payload }) => {
  if (payload && payload.length) {
    const { value } = payload[0];

    return (
      <FloatingTooltipWrapper>
        <span>{`Year: ${label}`}</span>
        <span>{formatTotalText(value, resourceType, timeUnit, true)}</span>
      </FloatingTooltipWrapper>
    );
  }

  return null;
};

const ResourceBarChart = ({
  resourceType,
  withCostMultiplier,
  countsMap,
  setCostRate,
  timeUnit
} :Props) => {
  const colors = RESOURCE_COLORS[resourceType];
  const data = countsMap
    .entrySeq()
    .sort(([year1], [year2]) => (year1 > year2 ? 1 : -1))
    .map(([year, count]) => ({ year, count }));

  const total = data.map(point => point.count).reduce((t1, t2) => t1 + t2) || 0;

  return (
    <BarChartWrapper>
      <Subtitle>Total: <span>{formatTotalText(total, timeUnit, resourceType)}</span></Subtitle>
      {withCostMultiplier
        ? <CostRateButton onClick={setCostRate}>Cost Rate</CostRateButton>
        : null
      }
      <BarChart width={400} height={400} data={data.toJS()}>
        <YAxis type="number" tickLine={false} />
        <XAxis type="category" tickLine={false} dataKey="year" domain={['dataMin', 'dataMax']} allowDecimals={false} />
        <Tooltip content={payloadData => renderBarChartTooltip(resourceType, timeUnit, payloadData)} />
        <Bar dataKey="count" fill={colors[0]} />
      </BarChart>
    </BarChartWrapper>
  );
};

export default ResourceBarChart;
