/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Set, List, Map } from 'immutable';
import {
  Cell,
  PieChart,
  Pie,
  Tooltip
} from 'recharts';

import NeighborPieChart from './NeighborPieChart';
import ChartWrapper from '../../charts/ChartWrapper';
import ChartTooltip from '../../charts/ChartTooltip';
import Legend from '../../charts/Legend';
import { getPieChartPropertyFqns } from '../../../utils/TagUtils';
import { getEntityKeyId } from '../../../utils/DataUtils';
import { CHART_COLORS } from '../../../utils/constants/Colors';

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
  pieProperties :Map<string, *>
}

const PieChartsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

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

const MAX_PIE_SIZE = 6;

export default class TopUtilizerPieCharts extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);

    const { pieProperties, piePropertiesByUtilizer, totalCounts } = this.getPieProperties(props);

    this.state = {
      utilizerPieProperties: this.getUtilizerPieProperties(props),
      pieProperties,
      piePropertiesByUtilizer,
      totalCounts
    };
  }

  componentWillReceiveProps(nextProps :Props) {
    const { neighborsById } = this.props;
    if (neighborsById !== nextProps.neighborsById) {
      const utilizerPieProperties = this.getUtilizerPieProperties(nextProps);
      const { pieProperties, piePropertiesByUtilizer, totalCounts } = this.getPieProperties(nextProps);
      this.setState({
        utilizerPieProperties,
        pieProperties,
        piePropertiesByUtilizer,
        totalCounts
      });
    }
  }

  getCountsForFqn = (initCounts, entity, fqn) => {
    let counts = initCounts;

    entity.get(fqn, List()).forEach((value) => {
      const formattedValue = `${value}`.trim();
      if (formattedValue) {
        counts = counts.set(formattedValue, counts.get(formattedValue, 0) + 1);
      }
    });

    return counts;
  }

  getUtilizerPieProperties = (props :Props) => {
    const { selectedEntityType, propertyTypesById, results } = props;

    let pieProperties = Map();

    const selfFqns = getPieChartPropertyFqns(selectedEntityType, propertyTypesById);

    results.forEach((entity) => {
      selfFqns.forEach((fqn) => {
        pieProperties = pieProperties.set(fqn, this.getCountsForFqn(pieProperties.get(fqn, Map()), entity, fqn));
      });
    });

    let bundledPieProperties = Map();

    pieProperties.entrySeq().forEach(([fqn, valueMap]) => {
      if (valueMap.size > MAX_PIE_SIZE) {

        let otherCount = 0;

        valueMap.sort().reverse().entrySeq()
          .forEach(([value, count], index) => {
            if (index < MAX_PIE_SIZE - 1) {
              bundledPieProperties = bundledPieProperties.setIn([fqn, value], count);
            }
            else {
              otherCount += count;
            }
          });

        if (otherCount) {
          bundledPieProperties = bundledPieProperties.setIn([fqn, 'Other'], otherCount);
        }
      }
      else {
        bundledPieProperties = bundledPieProperties.set(fqn, valueMap);
      }
    });

    return bundledPieProperties;
  }

  getPieProperties = (props :Props) => {
    const {
      entityTypesById,
      propertyTypesById,
      neighborsById,
      results
    } = props;
    /* pieProperties: Map<entityTypeId, Map<propertyTypeFqn, Map<propertyValue, count>>> */
    let pieProperties = Map();
    let piePropertiesByUtilizer = Map();
    let totalCounts = Map();

    let typesWithTags = Set();
    let typesWithoutTags = Set();

    results.forEach((result) => {
      const entityKeyId = getEntityKeyId(result);
      let neighborCounts = Map();

      neighborsById.get(entityKeyId, List()).forEach((neighborObj) => {
        const neighborEntityTypeId = neighborObj.getIn(['neighborEntitySet', 'entityTypeId']);

        if (neighborEntityTypeId) {
          totalCounts = totalCounts.set(neighborEntityTypeId, totalCounts.get(neighborEntityTypeId, 0) + 1);

          if (!typesWithoutTags.has(neighborEntityTypeId)) {

            const fqns = typesWithTags.has(neighborEntityTypeId)
              ? pieProperties.get(neighborEntityTypeId).keySeq()
              : getPieChartPropertyFqns(entityTypesById.get(neighborEntityTypeId, Map()), propertyTypesById);

            if (!fqns.count()) {
              typesWithoutTags = typesWithoutTags.add(neighborEntityTypeId);
            }
            else {
              typesWithTags = typesWithTags.add(neighborEntityTypeId);

              const entity = neighborObj.get('neighborDetails', Map());
              fqns.forEach((fqn) => {
                const fqnCounts = this.getCountsForFqn(
                  pieProperties.getIn([neighborEntityTypeId, fqn], Map()),
                  entity,
                  fqn
                );

                pieProperties = pieProperties.setIn([neighborEntityTypeId, fqn], fqnCounts);
                neighborCounts = neighborCounts.setIn(
                  [neighborEntityTypeId, fqn],
                  neighborCounts.getIn([neighborEntityTypeId, fqn], Set()).union(fqnCounts.keySeq())
                );
              });
            }

          }

        }
      });

      neighborCounts.entrySeq().forEach(([entityTypeId, fqnToCounts]) => {
        fqnToCounts.entrySeq().forEach(([fqn, values]) => {
          values.forEach((value) => {
            piePropertiesByUtilizer = piePropertiesByUtilizer.setIn(
              [entityTypeId, fqn, value],
              piePropertiesByUtilizer.getIn([entityTypeId, fqn, value], Set()).add(entityKeyId)
            );
          });
        });
      });

    });

    [pieProperties, piePropertiesByUtilizer] = this.bundleOtherValues(pieProperties, piePropertiesByUtilizer);

    return { pieProperties, piePropertiesByUtilizer, totalCounts };
  }

  bundleOtherValues = (piePropertiesInit, piePropertiesByUtilizerInit) => {
    let pieProperties = Map();
    let piePropertiesByUtilizer = Map();

    piePropertiesInit.entrySeq().forEach(([entityTypeId, fqnMap]) => {
      fqnMap.entrySeq().forEach(([fqn, valueMap]) => {
        if (valueMap.size > MAX_PIE_SIZE) {

          let otherCount = 0;
          let otherUtilizers = Set();

          valueMap.sort().reverse().entrySeq()
            .forEach(([value, count], index) => {
              if (index < MAX_PIE_SIZE - 1) {
                pieProperties = pieProperties.setIn([entityTypeId, fqn, value], count);
                piePropertiesByUtilizer = piePropertiesByUtilizer.setIn(
                  [entityTypeId, fqn, value],
                  piePropertiesByUtilizerInit.getIn([entityTypeId, fqn, value], Set()).size
                );
              }
              else {
                otherCount += count;
                otherUtilizers = otherUtilizers.add(piePropertiesByUtilizerInit.getIn([entityTypeId, fqn, value]));
              }
            });

          if (otherCount) {
            pieProperties = pieProperties.setIn([entityTypeId, fqn, 'Other'], otherCount);
            piePropertiesByUtilizer = piePropertiesByUtilizer.setIn([entityTypeId, fqn, 'Other'], otherUtilizers.size);
          }
        }
        else {
          pieProperties = pieProperties.setIn([entityTypeId, fqn], valueMap);

          valueMap.keySeq().forEach((value) => {
            piePropertiesByUtilizer = piePropertiesByUtilizer.setIn(
              [entityTypeId, fqn, value],
              piePropertiesByUtilizerInit.getIn([entityTypeId, fqn, value], Set()).size
            );
          });
        }
      });
    });

    return [pieProperties, piePropertiesByUtilizer];

  }

  getCleanPercentage = (top, bottom) => Math.round((top * 1000) / bottom) / 10;

  renderTooltip = ({ payload }) => {
    const { results } = this.props;

    const values = payload;
    if (values && values.length) {
      const { name, value } = values[0].payload;

      const numUtilizers = Number.parseInt(value, 10);
      const utilizerPercentage = this.getCleanPercentage(numUtilizers, results.size);

      return (
        <ChartTooltip>
          <TooltipRow>{name}</TooltipRow>
          <TooltipRow>{`${numUtilizers} utilizer${numUtilizers === 1 ? '' : 's'} (${utilizerPercentage}%)`}</TooltipRow>
        </ChartTooltip>
      );
    }
    return null;
  }

  renderPieChart = (fqn, valueMap) => {
    const { propertyTypesByFqn, selectedEntitySet } = this.props;

    const propertyTypeTitle = propertyTypesByFqn.getIn([fqn, 'title']);
    const title = `${selectedEntitySet.get('title')} - ${propertyTypeTitle}`;

    let colorsByValue = Map();
    const data = [];
    valueMap.entrySeq().forEach(([name, value], index) => {
      data.push({ name, value });
      colorsByValue = colorsByValue.set(name, CHART_COLORS[index % CHART_COLORS.length]);
    });

    return (
      <ChartWrapperContainer key={title}>
        <ChartWrapper title={title}>
          <Container>
            <PieChart width={400} height={400}>
              <Pie data={data} dataKey="value" cx={200} cy={200} outerRadius={120} fill="#8884d8">
                {data.map(({ name }) => <Cell key={name} fill={colorsByValue.get(name)} />)}
              </Pie>
              <Tooltip content={this.renderTooltip} />
            </PieChart>
            <Legend colorsByValue={colorsByValue} />
          </Container>
        </ChartWrapper>
      </ChartWrapperContainer>
    );
  }

  renderNeighborPieChart = (entityTypeId, fqn, valueMap) => {
    const { entityTypesById, propertyTypesByFqn, results } = this.props;
    const { pieProperties, piePropertiesByUtilizer, totalCounts } = this.state;

    const propertyTypeTitle = propertyTypesByFqn.getIn([fqn, 'title']);
    const title = `${entityTypesById.getIn([entityTypeId, 'title'])} - ${propertyTypeTitle}`;

    let colorsByValue = Map();

    const data = [];
    const utilizerData = [];
    valueMap.entrySeq().forEach(([name, value], index) => {
      data.push({
        entityTypeId,
        fqn,
        name,
        value
      });
      utilizerData.push({
        entityTypeId,
        fqn,
        name,
        value: piePropertiesByUtilizer.getIn([entityTypeId, fqn, name], 0)
      });

      colorsByValue = colorsByValue.set(name, CHART_COLORS[index % CHART_COLORS.length]);
    });

    return (
      <NeighborPieChart
          key={title}
          data={data}
          {...this.props}
          utilizerData={utilizerData}
          colorsByValue={colorsByValue}
          pieProperties={pieProperties}
          piePropertiesByUtilizer={piePropertiesByUtilizer}
          results={results}
          totalCounts={totalCounts}
          entityTypesById={entityTypesById}
          title={title} />
    );
  }

  render() {
    const { pieProperties, utilizerPieProperties } = this.state;

    if (!utilizerPieProperties.size && !pieProperties.size) {
      return null;
    }

    return (
      <PieChartsContainer>
        { utilizerPieProperties.entrySeq().map(([fqn, valueMap]) => this.renderPieChart(fqn, valueMap)) }
        {
          pieProperties.entrySeq().map(([entityTypeId, fqns]) => fqns.entrySeq()
            .map(([fqn, valueMap]) => this.renderNeighborPieChart(entityTypeId, fqn, valueMap)))
        }
      </PieChartsContainer>
    );
  }
}
