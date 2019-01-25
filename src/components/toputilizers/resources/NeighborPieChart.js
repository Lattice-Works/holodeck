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

type Props = {
  selectedEntitySet :Map<*, *>,
  selectedEntityType :Map<*, *>,
  entityTypesById :Map<string, *>,
  propertyTypesById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  countBreakdown :Map<string, *>,
  neighborsById :Map<string, *>,
  results :List<*>,
  pieProperties :Map<string, *>,
  piePropertiesByUtilizer :Map<string, *>,
  totalCounts :Map<string, *>,
  title :string,
  data :Object[],
  utilizerData :Object[],
  colorsByValue :Map<string, string>
};

type State = {
  hoverValue :?string
}


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

export default class NeighborPieChart extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);

    this.state = {
      hoverValue: undefined
    };
  }

  getCleanPercentage = (top, bottom) => Math.round((top * 1000) / bottom) / 10;

  renderNeighborTooltip = ({ payload }) => {
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

  getUpdateHoverValue = hoverValue => () => this.setState({ hoverValue })

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
                  return (
                    <Cell
                        key={name}
                        {...extraProps}
                        fill={colorsByValue.get(name)}
                        onMouseEnter={this.getUpdateHoverValue(name)}
                        onMouseLeave={this.getUpdateHoverValue(null)} />
                  );
                })}
              </Pie>
              <Pie data={data} dataKey="value" cx={200} cy={200} innerRadius={100} outerRadius={120} paddingAngle={2}>
                {data.map(({ name }) => {
                  const extraProps = name === hoverValue ? { stroke: '#000000', strokeWidth: 2 } : {};
                  return (
                    <Cell
                        key={name}
                        {...extraProps}
                        fill={colorsByValue.get(name)}
                        onMouseEnter={this.getUpdateHoverValue(name)}
                        onMouseLeave={this.getUpdateHoverValue(null)} />
                  );
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
