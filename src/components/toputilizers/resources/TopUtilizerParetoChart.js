/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  ComposedChart,
  Tooltip
} from 'recharts';

import ChartTooltip from '../../charts/ChartTooltip';
import ChartWrapper from '../../charts/ChartWrapper';
import { CHART_EXPLANATIONS, PARETO_LABELS } from '../../../utils/constants/TopUtilizerConstants';
import { COUNT_FQN } from '../../../utils/constants/DataConstants';

type Props = {
  countBreakdown :Map<*, *>,
  color :string,
  entityTypeTitle :string,
  pair :List<string>
}

const TooltipRow = styled.div`
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const ParetoTooltip = ({ payload, eventType }) => {
  if (!payload.length) return null;

  const values = payload[0].payload;
  return (
    <ChartTooltip>
      <TooltipRow>
        <div>{`Num. of ${eventType.toLowerCase()}: ${values[PARETO_LABELS.COUNT]}`}</div>
      </TooltipRow>
      <TooltipRow>
        <div>{`${PARETO_LABELS.INDIVIDUAL_PERCENTAGE}: ${values[PARETO_LABELS.INDIVIDUAL_PERCENTAGE]}%`}</div>
      </TooltipRow>
      <TooltipRow>
        <div>{`${PARETO_LABELS.CUMULATIVE_PERCENTAGE}: ${values[PARETO_LABELS.CUMULATIVE_PERCENTAGE]}%`}</div>
      </TooltipRow>
    </ChartTooltip>
  );
}

const TopUtilizerParetoChart = ({
  countBreakdown,
  color,
  entityTypeTitle,
  pair
} :Props) => {
  const chartTitle = `Cumulative Sum of ${entityTypeTitle}`;
  const top100 = countBreakdown
    .valueSeq()
    .sort((counts1, counts2) => (counts1.getIn([pair, COUNT_FQN], 0) < counts2.getIn([pair, COUNT_FQN], 0) ? 1 : -1));

  let total = 0;
  top100.forEach((counts) => {
    total += counts.getIn([pair, COUNT_FQN], 0);
  });

  const getCleanPercentage = (top, bottom) => Math.round((top * 1000) / bottom) / 10;

  let sum = 0;
  const data = top100.slice(0, 30).map((counts, index) => {
    const count = counts.getIn([pair, COUNT_FQN], 0);
    sum += count;

    return {
      [PARETO_LABELS.UTILIZER_NUM]: index + 1,
      [PARETO_LABELS.COUNT]: count,
      [PARETO_LABELS.INDIVIDUAL_PERCENTAGE]: getCleanPercentage(count, total),
      [PARETO_LABELS.CUMULATIVE_PERCENTAGE]: getCleanPercentage(sum, total)
    };
  });

  return (
    <ChartWrapper
        key={pair}
        title={chartTitle}
        xLabel="Top 30 Utilizers"
        yLabel="Number of Events"
        yLabelRight="Cumulative Percent"
        infoText={CHART_EXPLANATIONS.PARETO}>
      <ComposedChart width={840} height={390} data={data.toJS()}>
        <XAxis type="category" dataKey={PARETO_LABELS.UTILIZER_NUM} tickLine={false} />
        <YAxis type="number" tickLine={false} yAxisId="left" orientation="left" />
        <YAxis type="number" tickLine={false} yAxisId="right" orientation="right" />
        <Tooltip content={({ payload }) => <ParetoTooltip payload={payload} eventType={entityTypeTitle} />} />
        <Bar dataKey={PARETO_LABELS.COUNT} barSize={20} fill="#cdd1db" yAxisId="left" />
        <Line
            dataKey={PARETO_LABELS.CUMULATIVE_PERCENTAGE}
            strokeWidth={2}
            stroke={color}
            yAxisId="right"
            dot={false} />
      </ComposedChart>
    </ChartWrapper>
  );
};

export default TopUtilizerParetoChart;
