/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import {
  Cell,
  PieChart,
  Pie,
  Tooltip
} from 'recharts';

import ChartWrapper from '../../charts/ChartWrapper';
import ChartTooltip from '../../charts/ChartTooltip';
import Legend from '../../charts/Legend';

const ChartWrapperContainer = styled.div`
  width: 49%;
`;

const TooltipRow = styled.div`
  margin: 5px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

type Props = {
  colorsByValue :Map<string, string>;
  countBreakdown :Map<string, *>;
  data :Object[];
  entityTypesById :Map<string, *>;
  neighborsById :Map<string, *>;
  pieProperties :Map<string, *>;
  piePropertiesByUtilizer :Map<string, *>;
  propertyTypesByFqn :Map<string, *>;
  propertyTypesById :Map<string, *>;
  results :List<*>;
  selectedEntitySet :Map<*, *>;
  selectedEntityType :Map<*, *>;
  title :string;
  totalCounts :Map<string, *>;
  utilizerData :Object[];
};

type State = {
  hoverValue :?string;
};

export default class NeighborPieChart extends React.Component<Props, State> {

  constructor(props :Props) {

    super(props);

    this.state = {
      hoverValue: undefined
    };
  }

  getCleanPercentage = (top :number, bottom :number) => Math.round((top * 1000) / bottom) / 10;

  renderNeighborTooltip = ({ payload } :Object) => {
    const {
      pieProperties,
      piePropertiesByUtilizer,
      results,
      totalCounts
    } = this.props;

    const values = payload;
    if (values && values.length) {
      const { entityTypeId, fqn, name } = values[0].payload;

      const numUtilizers = piePropertiesByUtilizer.getIn([entityTypeId, fqn, name], 0);
      const utilizerPercentage = this.getCleanPercentage(numUtilizers, results.size);

      const eventCount = pieProperties.getIn([entityTypeId, fqn, name], 0);
      const eventPercentage = this.getCleanPercentage(eventCount, totalCounts.get(entityTypeId, 0));

      return (
        <ChartTooltip>
          <TooltipRow>{name}</TooltipRow>
          <TooltipRow>{`${numUtilizers} utilizer${numUtilizers === 1 ? '' : 's'} (${utilizerPercentage}%)`}</TooltipRow>
          <TooltipRow>{`${eventCount} total occurence${eventCount === 1 ? '' : 's'} (${eventPercentage}%)`}</TooltipRow>
        </ChartTooltip>
      );
    }
    return null;
  }

  getUpdateHoverValue = (hoverValue :?string) => () => this.setState({ hoverValue })

  render() {
    const {
      title,
      data,
      utilizerData,
      colorsByValue
    } = this.props;
    const { hoverValue } = this.state;

    return (
      <ChartWrapperContainer key={title}>
        <ChartWrapper title={title}>
          <Container>
            <PieChart width={400} height={400}>
              <Pie data={utilizerData} dataKey="value" cx={200} cy={200} outerRadius={90} paddingAngle={2}>
                {utilizerData.map(({ name }) => {
                  const extraProps = name === hoverValue ? { stroke: '#000000', strokeWidth: 2 } : {};
                  /* eslint-disable react/jsx-props-no-spreading */
                  return (
                    <Cell
                        key={name}
                        {...extraProps}
                        fill={colorsByValue.get(name)}
                        onMouseEnter={this.getUpdateHoverValue(name)}
                        onMouseLeave={this.getUpdateHoverValue(null)} />
                  );
                  /* eslint-enable */
                })}
              </Pie>
              <Pie data={data} dataKey="value" cx={200} cy={200} innerRadius={100} outerRadius={120} paddingAngle={2}>
                {data.map(({ name }) => {
                  const extraProps = name === hoverValue ? { stroke: '#000000', strokeWidth: 2 } : {};
                  /* eslint-disable react/jsx-props-no-spreading */
                  return (
                    <Cell
                        key={name}
                        {...extraProps}
                        fill={colorsByValue.get(name)}
                        onMouseEnter={this.getUpdateHoverValue(name)}
                        onMouseLeave={this.getUpdateHoverValue(null)} />
                  );
                  /* eslint-enable */
                })}
              </Pie>
              <Tooltip content={this.renderNeighborTooltip} />
            </PieChart>
            <Legend colorsByValue={colorsByValue} />
          </Container>
        </ChartWrapper>
      </ChartWrapperContainer>
    );
  }
}
