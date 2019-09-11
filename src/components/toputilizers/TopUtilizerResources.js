/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
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

import LoadingSpinner from '../loading/LoadingSpinner';
import ChartWrapper from '../charts/ChartWrapper';
import CostRateModal from './CostRateModal';
import ResourceBarChart from './resources/ResourceBarChart';
import ResourceTimeline from './resources/ResourceTimeline';
import ResourceDropdownFilter from './resources/ResourceDropdownFilter';
import { getEntityTitle } from '../../utils/TagUtils';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { RESOURCE_TYPES, DEFAULT_COST_RATES } from '../../utils/constants/TopUtilizerConstants';
import {
  DURATION_TYPES,
  DURATION_DAY_TYPES,
  DURATION_HOUR_TYPES,
  DURATION_MINUTE_TYPES
} from '../../utils/constants/DataModelConstants';
import {
  CenteredColumnContainer,
  FixedWidthWrapper,
  LoadingText,
  TitleText
} from '../layout/Layout';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';
import { getEntityEventDates, getDateFilters, matchesFilters } from '../../utils/EntityDateUtils';

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

type Props = {
  countBreakdown :Map<string, *>;
  entityTypesById :Map<string, *>;
  isLoading :boolean;
  lastQueryRun :string;
  neighborsById :Map<string, *>;
  propertyTypesById :Map<string, *>;
  results :List<*>;
  selectedEntityType :Map<string, *>;
};

type State = {
  SELECTED_TYPE :Object;
  SELECTED_UTILIZER :Object;
  costRates :Map<List<string>, number>;
  displayDefaultCostBanner :boolean;
  durationTypes :Map;
  isSettingCostRate :boolean;
  processedDates :Map<*, *>;
};

export default class TopUtilizerResources extends React.Component<Props, State> {

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

    const {
      countBreakdown,
      entityTypesById,
      lastQueryRun,
      neighborsById,
      propertyTypesById,
      results,
    } = this.props;

    this.preprocess({
      countBreakdown,
      entityTypesById,
      lastQueryRun,
      neighborsById,
      propertyTypesById,
      results,
    });
  }

  componentWillReceiveProps(nextProps :Props) {

    const { neighborsById } = this.props;
    const {
      countBreakdown,
      entityTypesById,
      lastQueryRun,
      propertyTypesById,
      results,
      neighborsById: nextNeighborsById,
    } = nextProps;

    if (nextNeighborsById.size !== neighborsById.size) {
      this.preprocess({
        countBreakdown,
        entityTypesById,
        lastQueryRun,
        propertyTypesById,
        results,
        neighborsById: nextNeighborsById,
      });
    }
  }

  getBlankMap = (pairs :any) => {
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

    return countBreakdown.first().keySeq().filter((key) => key !== 'score').toOrderedSet();
  }

  getDurationTypes = () => {
    const { countBreakdown } = this.props;

    let durationTypes = Map();

    if (countBreakdown) {
      countBreakdown.first().entrySeq().filter(([pair]) => pair !== 'score').forEach(([pair, propertyTypeMap]) => {
        propertyTypeMap.keySeq().filter((ptId) => ptId !== COUNT_FQN).forEach((ptId) => {
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

  getDefaultCostRate = (propertyTypeId :UUID) => {
    const { propertyTypesById } = this.props;
    const fqn = getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'], Map()));
    return DEFAULT_COST_RATES[fqn] || 0;
  }

  preprocess = ({
    countBreakdown,
    entityTypesById,
    lastQueryRun,
    neighborsById,
    propertyTypesById,
    results,
  } :Object) => {

    if (!countBreakdown.size) {
      return;
    }

    const allPairs = this.getAllPairs();
    const blankMap = this.getBlankMap(allPairs);
    const durationTypes = this.getDurationTypes();
    const dateFilters = getDateFilters(lastQueryRun, propertyTypesById);

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

            if (matchesFilters(pair, dateFilters, associationDetails, neighborDetails)) {
            /* Deal with dates */
              [
                ...getEntityEventDates(entityTypesById.get(assocId, Map()), propertyTypesById, associationDetails),
                ...getEntityEventDates(entityTypesById.get(neighborId, Map()), propertyTypesById, neighborDetails),
              ].forEach((date) => {
                const dateStr = date.format(MONTH_FORMAT);
                dateMap = dateMap.setIn([pair, dateStr], dateMap.getIn([pair, dateStr], 0) + 1);
              });

              /* Deal with durations */
              durationTypes.get(pair, Set()).forEach((propertyTypeId) => {
                const getValue = (fqn) => neighborDetails.getIn([fqn, 0], associationDetails.getIn([fqn, 0]));

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

  renderSelectDropdown = (key :string, label :string, options :Object) => {
    const onChange = (newValue) => {
      this.setState({ [key]: newValue });
    };
    const { [key]: value } = this.state;
    return <ResourceDropdownFilter value={value} label={label} options={options} onChange={onChange} />;
  }

  getCountsByYearAndMonth = (useCounts :any, withMultiplier :boolean) => {
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

    const { [FILTERS.SELECTED_UTILIZER]: selectedUtilizer } = this.state;
    const { value } = selectedUtilizer;
    if (value && value.length) {
      updateCounts(processedValues.get(value));
    }
    else {
      processedValues.valueSeq().forEach((countsMap) => updateCounts(countsMap));
    }

    return counts;
  }

  getFilteredCountsForType = (useCounts :boolean, byMonth :boolean, withMultiplier :boolean) => {
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

    const { [FILTERS.SELECTED_TYPE]: selectedType } = this.state;
    const { value } = selectedType;
    if (value && value.size) {
      const key = useCounts ? value.slice(0, 2) : value;
      updateCountsByDate(key);
    }
    else {
      pairDateCounts
        .keySeq()
        .filter((key) => (useCounts ? key.size === 2 : key.size === 3))
        .forEach((pair) => updateCountsByDate(pair));
    }

    return counts;
  }

  renderSimpleBarChart = (resourceType :string, byDates :boolean, withCostMultiplier :boolean) => (
    <ResourceBarChart
        resourceType={resourceType}
        withCostMultiplier={withCostMultiplier}
        timeUnit={this.getTimeUnit()}
        setCostRate={() => this.setState({ isSettingCostRate: true })}
        countsMap={this.getFilteredCountsForType(byDates, false, withCostMultiplier)} />
  )

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
        const toTitle = (index) => entityTypesById.getIn([pair.get(index), 'title'], '');
        const prefix = `${toTitle(0)} ${toTitle(1)}`;
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
      selectedEntityType,
      propertyTypesById
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
        const label = getEntityTitle(selectedEntityType, propertyTypesById, utilizer);
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
          {this.renderSimpleBarChart(RESOURCE_TYPES.EVENTS, true, false)}
        </SimpleWrapper>
      </WideSplitCard>
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
        <span>
          {`Default costs shown are based on rough estimates or national averages. See Cost
            Rate for more details, and set custom cost rates to get more accurate results.`}
        </span>
        <button type="button" onClick={() => this.setState({ displayDefaultCostBanner: false })}>
          <FontAwesomeIcon icon={faTimes} size="2x" />
        </button>
      </NotificationBanner>
    );
  }

  renderTimeline = () => (
    <ResourceTimeline
        countsByYearAndMonth={this.getFilteredCountsForType(true, true, false)}
        durationByYearAndMonth={this.getFilteredCountsForType(false, true, false)}
        timeUnit={this.getTimeUnit()} />
  )

  renderDurationAndCost = () => {
    const { durationTypes } = this.state;
    if (!durationTypes.size) {
      return null;
    }

    return (
      <RowWrapper>
        <ChartCard>
          <ChartWrapper title={this.getTimeUnit()}>
            {this.renderSimpleBarChart(RESOURCE_TYPES.DURATION, false, false)}
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
    const onSetCostRate = (newCostRates) => this.setState({ costRates: newCostRates });
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
