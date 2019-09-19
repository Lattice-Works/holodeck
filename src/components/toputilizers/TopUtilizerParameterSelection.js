/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, List, Set } from 'immutable';
import { Models } from 'lattice';

import BackNavButton from '../buttons/BackNavButton';
import TabNavButton from '../buttons/TabNavButton';
import InfoButton from '../buttons/InfoButton';
import DropdownButtonWrapper from '../buttons/DropdownButtonWrapper';
import Banner from '../cards/Banner';
import TopUtilizersSelect from './TopUtilizersSelect';
import CountTypeOptions from './searchoptions/CountTypeOptions';
import MultiDateRangePicker from './searchoptions/MultiDateRangePicker';
import WeightsPicker from './searchoptions/WeightsPicker';
import PropertyTypeFilterOptions from './searchoptions/PropertyTypeFilterOptions';
import { DURATION_TYPES, PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { COUNT_TYPES, RESULT_DISPLAYS, TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';

import {
  FixedWidthWrapper,
  HeaderComponentWrapper,
  InputGroup,
  InputLabel
} from '../layout/Layout';

const { FullyQualifiedName } = Models;

const CenteredHeaderWrapper = styled(HeaderComponentWrapper)`
  display: flex;
  justify-content: center;
  padding: 30px 0;
`;

const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 15px 0 40px 0;

  span {
    margin-left: 10px;
    color: #b6bbc7;

    &:first-child {
      margin-left: 20px;
    }
  }
`;

const InputRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 30px;
`;

const TabButtonRow = styled.div`
  margin: 20px 0 -30px 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`;

const StyledBanner = styled(Banner)`
  color: #ffffff !important;
`;

const newDateRange = {
  start: '',
  end: '',
  properties: Set()
};

type Props = {
  changeNumUtilizers :(numUtilizers :number) => void;
  changeTopUtilizersDisplay :(display :string) => void;
  deselectEntitySet :() => void;
  display :string;
  entityTypes :List;
  entityTypesIndexMap :Map;
  filteredPropertyTypes :List<*>;
  getTopUtilizers :(obj :Object) => void;
  isLoadingNeighborTypes :boolean;
  neighborTypes :List<*>;
  numberOfUtilizers :number;
  onPropertyTypeChange :(propertyTypeId :string) => void;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
  searchHasRun :boolean;
  selectedEntitySet :Map<*, *>;
  selectedEntitySetPropertyTypes :List<*>;
  selectedEntitySetSize :?number;
};

type State = {
  countType :string;
  dateRangeViewing :number;
  dateRanges :List;
  durationTypeWeights :Map<*, *>;
  selectedNeighborTypes :Object[];
};
export default class TopUtilizerParameterSelection extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      selectedNeighborTypes: [],
      dateRanges: List.of(newDateRange),
      dateRangeViewing: 0,
      countType: COUNT_TYPES.EVENTS,
      durationTypeWeights: Map()
    };
  }

  searchTopUtilizers = () => {
    const {
      changeNumUtilizers,
      entityTypes,
      entityTypesIndexMap,
      filteredPropertyTypes,
      getTopUtilizers,
      selectedEntitySet,
      numberOfUtilizers
    } = this.props;
    const {
      countType,
      dateRanges,
      durationTypeWeights,
      selectedNeighborTypes
    } = this.state;
    const entitySetId = selectedEntitySet.get('id');

    let numResults = Number.parseInt(numberOfUtilizers, 10);
    if (Number.isNaN(numResults)) {
      numResults = 100;
    }
    changeNumUtilizers(numResults);

    getTopUtilizers({
      entitySetId,
      numResults,
      eventFilters: selectedNeighborTypes,
      dateFilters: dateRanges,
      countType,
      durationTypeWeights,
      entityTypes,
      entityTypesIndexMap,
      filteredPropertyTypes
    });
  }

  renderPropertyTypeFilterOptions = () => {
    const { selectedEntitySetPropertyTypes, filteredPropertyTypes, onPropertyTypeChange } = this.props;

    return (
      <PropertyTypeFilterOptions
          selectedEntitySetPropertyTypes={selectedEntitySetPropertyTypes}
          filteredPropertyTypes={filteredPropertyTypes}
          onPropertyTypeChange={onPropertyTypeChange} />
    );
  }

  renderNavButton = (buttonDisplay :string) => {
    const { display, changeTopUtilizersDisplay } = this.props;

    const selected = buttonDisplay === display;
    return (
      <TabNavButton selected={selected} onClick={() => changeTopUtilizersDisplay(buttonDisplay)}>
        {buttonDisplay}
      </TabNavButton>
    );
  }

  getDurationPropertiesForType = (entityTypeId :UUID) => {

    const {
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    const entityTypeIndex = entityTypesIndexMap.get(entityTypeId);
    const entityType = entityTypes.get(entityTypeIndex, Map());
    return entityType.get('properties', List())
      .filter((propertyTypeId) => {
        const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
        const propertyType = propertyTypes.get(propertyTypeIndex, Map());
        const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
        return !!DURATION_TYPES[propertyTypeFQN];
      });

  }

  getAvailableDurationProperties = () => {
    const { selectedNeighborTypes } = this.state;

    let available = Map();

    selectedNeighborTypes.forEach((neighborTypeObj) => {
      const assocId = neighborTypeObj[TOP_UTILIZERS_FILTER.ASSOC_ID];
      const neighborId = neighborTypeObj[TOP_UTILIZERS_FILTER.NEIGHBOR_ID];

      const durationProperties = this.getDurationPropertiesForType(assocId)
        .concat(this.getDurationPropertiesForType(neighborId));

      if (durationProperties.size) {
        available = available.set(List.of(assocId, neighborId), durationProperties);
      }
    });

    return available;
  }

  renderSearchOption = () => {
    const {
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
      numberOfUtilizers,
      changeNumUtilizers
    } = this.props;
    const { countType, durationTypeWeights, selectedNeighborTypes } = this.state;

    return (
      <CountTypeOptions
          availableDurationProperties={this.getAvailableDurationProperties()}
          countType={countType}
          durationTypeWeights={durationTypeWeights}
          entityTypes={entityTypes}
          entityTypesIndexMap={entityTypesIndexMap}
          numberOfUtilizers={numberOfUtilizers}
          onChange={(e) => this.setState({ countType: e.target.value })}
          onDurationWeightChange={(newWeights) => this.setState({ durationTypeWeights: newWeights })}
          onNumUtilizersChange={changeNumUtilizers}
          propertyTypes={propertyTypes}
          propertyTypesIndexMap={propertyTypesIndexMap}
          selectedNeighborTypes={selectedNeighborTypes} />
    );
  }

  renderDateRangePicker = () => {
    const {
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;
    const { dateRanges, dateRangeViewing, selectedNeighborTypes } = this.state;

    const onAddRange = () => this.setState({
      dateRanges: dateRanges.push(newDateRange),
      dateRangeViewing: dateRanges.size
    });

    return (
      <MultiDateRangePicker
          dateRangeViewing={dateRangeViewing}
          dateRanges={dateRanges}
          entityTypes={entityTypes}
          entityTypesIndexMap={entityTypesIndexMap}
          onAddRange={onAddRange}
          onDateRangeChange={(newDateRanges) => this.setState({ dateRanges: newDateRanges })}
          propertyTypes={propertyTypes}
          propertyTypesIndexMap={propertyTypesIndexMap}
          selectedNeighborTypes={selectedNeighborTypes}
          setDateRangeViewing={(index) => this.setState({ dateRangeViewing: index })} />
    );
  }

  resetWeights = () => {
    const { selectedNeighborTypes } = this.state;
    const resetTypes = selectedNeighborTypes.map((type) => ({
      ...type,
      [TOP_UTILIZERS_FILTER.WEIGHT]: 1
    }));
    this.setState({ selectedNeighborTypes: resetTypes });
  }

  renderWeightsPicker = () => {
    const { selectedNeighborTypes } = this.state;

    return (
      <WeightsPicker
          selectedNeighborTypes={selectedNeighborTypes}
          setNeighborTypes={(neighborTypes) => this.setState({ selectedNeighborTypes: neighborTypes })}
          resetWeights={this.resetWeights} />
    );
  }

  onSelectedNeighborPairChange = (newList :Object[]) => {
    const { countType, durationTypeWeights } = this.state;

    let newDurationTypeWeights = Map();

    newList.forEach((neighborTypeObj) => {
      const assocId = neighborTypeObj[TOP_UTILIZERS_FILTER.ASSOC_ID];
      const neighborId = neighborTypeObj[TOP_UTILIZERS_FILTER.NEIGHBOR_ID];

      const durationPropertyTypes = this.getDurationPropertiesForType(assocId)
        .concat(this.getDurationPropertiesForType(neighborId));

      if (durationPropertyTypes.size) {
        const pair = List.of(assocId, neighborId);
        durationPropertyTypes.forEach((propertyTypeId) => {

          newDurationTypeWeights = newDurationTypeWeights.setIn(
            [pair, propertyTypeId],
            durationTypeWeights.getIn([pair, propertyTypeId], 1)
          );

        });
      }
    });

    const newCountType = newList.length === newDurationTypeWeights.size ? countType : COUNT_TYPES.EVENTS;

    this.setState({
      selectedNeighborTypes: newList,
      durationTypeWeights: newDurationTypeWeights,
      countType: newCountType
    });
  }

  canRenderLocations = () => {
    const {
      entityTypes,
      entityTypesIndexMap,
      neighborTypes,
      propertyTypes,
      selectedEntitySet,
    } = this.props;

    const locationId = propertyTypes
      .find((propertyType :Map) => {
        const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
        return propertyTypeFQN === PROPERTY_TYPES.LOCATION;
      })
      .get('id');

    const entityTypeId = selectedEntitySet.get('entityTypeId');
    const entityTypeIndex = entityTypesIndexMap.get(entityTypeId);
    const entityType = entityTypes.get(entityTypeIndex, Map());
    if (entityType.get('properties').includes(locationId)) {
      return true;
    }

    let shouldRender = false;

    neighborTypes.forEach((type) => {
      if (type.getIn(['neighborEntityType', 'properties']).includes(locationId)) {
        shouldRender = true;
      }
    });

    return shouldRender;
  }

  render() {
    const { selectedNeighborTypes } = this.state;
    const {
      deselectEntitySet,
      isLoadingNeighborTypes,
      neighborTypes,
      searchHasRun,
      selectedEntitySet,
      selectedEntitySetSize,
    } = this.props;

    const entitySetTitle = selectedEntitySet.get('title');
    return (
      <CenteredHeaderWrapper>
        <FixedWidthWrapper>
          <BackNavButton onClick={deselectEntitySet}>Back to dataset selection</BackNavButton>
          <Title>
            <div>Search</div>
            <span><FontAwesomeIcon icon={faDatabase} /></span>
            <span>{entitySetTitle}</span>
            {
              typeof selectedEntitySetSize === 'number' && (
                <StyledBanner>
                  {`${selectedEntitySetSize.toLocaleString()} ${selectedEntitySetSize === 1 ? 'entity' : 'entities'}`}
                </StyledBanner>
              )
            }
          </Title>
          <InputRow>
            <InputGroup fullSize>
              <InputLabel>Search Parameter</InputLabel>
              <TopUtilizersSelect
                  selectedEntitySet={selectedEntitySet}
                  isLoadingNeighborTypes={isLoadingNeighborTypes}
                  neighborTypes={neighborTypes}
                  selectedNeighborTypes={selectedNeighborTypes}
                  onChange={this.onSelectedNeighborPairChange} />
            </InputGroup>
          </InputRow>
          <InputRow>
            <InputGroup>
              <DropdownButtonWrapper title="Search Option" width={550} short fullSize>
                {this.renderSearchOption()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Date Range" width={800} short fullSize>
                {this.renderDateRangePicker()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Weights" width={600} short fullSize>
                {this.renderWeightsPicker()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <DropdownButtonWrapper title="Properties" width={800} short fullSize>
                {this.renderPropertyTypeFilterOptions()}
              </DropdownButtonWrapper>
            </InputGroup>
            <InputGroup>
              <InfoButton onClick={this.searchTopUtilizers} fullSize>Find Top Utilizers</InfoButton>
            </InputGroup>
          </InputRow>
          {
            searchHasRun ? (
              <TabButtonRow>
                {this.renderNavButton(RESULT_DISPLAYS.SEARCH_RESULTS)}
                {this.renderNavButton(RESULT_DISPLAYS.DASHBOARD)}
                {this.renderNavButton(RESULT_DISPLAYS.RESOURCES)}
                {this.canRenderLocations() ? this.renderNavButton(RESULT_DISPLAYS.MAP) : null}
              </TabButtonRow>
            ) : null
          }
        </FixedWidthWrapper>
      </CenteredHeaderWrapper>
    );
  }
}
