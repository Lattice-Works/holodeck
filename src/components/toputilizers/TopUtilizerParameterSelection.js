/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map, List, Set } from 'immutable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase } from '@fortawesome/pro-solid-svg-icons';

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
import { DURATION_TYPES } from '../../utils/constants/DataModelConstants';
import { COUNT_TYPES, RESULT_DISPLAYS, TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { getFqnString } from '../../utils/DataUtils';
import {
  FixedWidthWrapper,
  HeaderComponentWrapper,
  InputGroup,
  InputLabel
} from '../layout/Layout';

type Props = {
  display :string,
  searchHasRun :boolean,
  isLoadingNeighborTypes :boolean,
  neighborTypes :List<*>,
  numberOfUtilizers :number,
  propertyTypesById :Map<string, Map<*, *>>,
  entityTypesById :Map<string, Map<*, *>>,
  selectedEntitySet :?Map<*, *>,
  selectedEntitySetSize :?number,
  selectedEntitySetPropertyTypes :List<*>,
  filteredPropertyTypes :List<*>,
  onPropertyTypeChange :(propertyTypeId :string) => void,
  changeTopUtilizersDisplay :(display :string) => void,
  deselectEntitySet :() => void,
  getTopUtilizers :() => void,
  changeNumUtilizers :(numUtilizers :number) => void
};

type State = {
  countType :string,
  dateRanges :List,
  dateRangeViewing :boolean,
  selectedNeighborTypes :Object[],
  durationTypeWeights :Map<*, *>
};

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

const newDateRange = Object.assign({}, {
  start: '',
  end: '',
  properties: Set()
});

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
      entityTypesById,
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

    getTopUtilizers({
      entitySetId,
      numResults: numberOfUtilizers,
      eventFilters: selectedNeighborTypes,
      dateFilters: dateRanges,
      countType,
      durationTypeWeights,
      entityTypesById,
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

  renderNavButton = (buttonDisplay) => {
    const { display, changeTopUtilizersDisplay } = this.props;

    const selected = buttonDisplay === display;
    return (
      <TabNavButton selected={selected} onClick={() => changeTopUtilizersDisplay(buttonDisplay)}>
        {buttonDisplay}
      </TabNavButton>
    );
  }

  getDurationPropertiesForType = (entityTypeId) => {
    const { entityTypesById, propertyTypesById } = this.props;

    return entityTypesById.getIn([entityTypeId, 'properties'], List())
      .filter((propertyTypeId) => {
        const fqn = getFqnString(propertyTypesById.getIn([propertyTypeId, 'type']));
        return !!DURATION_TYPES[fqn];
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
      entityTypesById,
      propertyTypesById,
      numberOfUtilizers,
      changeNumUtilizers
    } = this.props;
    const { countType, durationTypeWeights, selectedNeighborTypes } = this.state;

    return (
      <CountTypeOptions
          entityTypesById={entityTypesById}
          propertyTypesById={propertyTypesById}
          countType={countType}
          numberOfUtilizers={numberOfUtilizers}
          onNumUtilizersChange={changeNumUtilizers}
          durationTypeWeights={durationTypeWeights}
          selectedNeighborTypes={selectedNeighborTypes}
          availableDurationProperties={this.getAvailableDurationProperties()}
          onChange={e => this.setState({ countType: e.target.value })}
          onDurationWeightChange={newWeights => this.setState({ durationTypeWeights: newWeights })} />
    );
  }

  renderDateRangePicker = () => {
    const { entityTypesById, propertyTypesById } = this.props;
    const { dateRanges, dateRangeViewing, selectedNeighborTypes } = this.state;

    const onAddRange = () => this.setState({
      dateRanges: dateRanges.push(newDateRange),
      dateRangeViewing: dateRanges.size
    });

    return (
      <MultiDateRangePicker
          entityTypesById={entityTypesById}
          propertyTypesById={propertyTypesById}
          dateRanges={dateRanges}
          dateRangeViewing={dateRangeViewing}
          onAddRange={onAddRange}
          setDateRangeViewing={index => this.setState({ dateRangeViewing: index })}
          onDateRangeChange={newDateRanges => this.setState({ dateRanges: newDateRanges })}
          selectedNeighborTypes={selectedNeighborTypes} />
    );
  }

  resetWeights = () => {
    const { selectedNeighborTypes } = this.state;
    const resetTypes = selectedNeighborTypes.map(type => Object.assign({}, type, { [TOP_UTILIZERS_FILTER.WEIGHT]: 1 }));
    this.setState({ selectedNeighborTypes: resetTypes });
  }

  renderWeightsPicker = () => {
    const { selectedNeighborTypes } = this.state;

    return (
      <WeightsPicker
          selectedNeighborTypes={selectedNeighborTypes}
          setNeighborTypes={neighborTypes => this.setState({ selectedNeighborTypes: neighborTypes })}
          resetWeights={this.resetWeights} />
    );
  }

  onSelectedNeighborPairChange = (newList) => {
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

  render() {
    const { selectedNeighborTypes } = this.state;
    const {
      searchHasRun,
      selectedEntitySet,
      selectedEntitySetSize,
      deselectEntitySet,
      isLoadingNeighborTypes,
      neighborTypes
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
            {selectedEntitySetSize === undefined
              ? null
              : (
                <StyledBanner>
                  {`${selectedEntitySetSize.toLocaleString()} ${selectedEntitySetSize === 1 ? 'entity' : 'entities'}`}
                </StyledBanner>)
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
              </TabButtonRow>
            ) : null
          }
        </FixedWidthWrapper>
      </CenteredHeaderWrapper>
    );
  }
}
