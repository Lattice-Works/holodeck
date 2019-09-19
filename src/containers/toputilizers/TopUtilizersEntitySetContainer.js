/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { Models } from 'lattice';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EntitySetSearch from '../entitysets/EntitySetSearch';
import SearchResultsContainer from '../explore/SearchResultsContainer';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import TopUtilizerDashboard from '../../components/toputilizers/TopUtilizerDashboard';
import TopUtilizerResources from '../../components/toputilizers/TopUtilizerResources';
import TopUtilizerMap from '../../components/toputilizers/TopUtilizerMap';
import {
  STATE,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { PROPERTY_TAGS } from '../../utils/constants/DataModelConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';
import { getEntitySetPropertyTypes } from '../../utils/DataUtils';
import * as EntitySetActions from '../entitysets/EntitySetActions';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as TopUtilizersActionFactory from './TopUtilizersActionFactory';
import * as Routes from '../../core/router/Routes';

const { FullyQualifiedName } = Models;

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

type Props = {
  actions :{
    changeNumUtilizers :(numUtilizers :number) => void;
    changeTopUtilizersDisplay :(display :string) => void;
    clearTopUtilizersResults :() => void;
    getNeighborTypes :(id :string) => void;
    getTopUtilizers :() => void;
    // loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void;
    reIndexEntitiesById :(unfilteredTopUtilizerResults :List<*>) => void;
    // selectBreadcrumb :(index :number) => void;
    // selectEntity :(entityKeyId :string) => void;
    selectEntitySet :(entitySet? :Map<*, *>) => void;
    selectEntitySetById :(id :string) => void;
    unmountTopUtilizers :() => void;
    updateFilteredTypes :(filteredTypes :Set<*>) => void;
  };
  countBreakdown :Map<*, *>;
  display :string;
  entitySetsMetaData :Map;
  entityTypes :List;
  entityTypesIndexMap :Map;
  filteredPropertyTypes :Set<string>;
  history :string[];
  isLoadingNeighborTypes :boolean;
  isLoadingResultCounts :boolean;
  isLoadingResults :boolean;
  lastQueryRun :string;
  locationsById :Map<string, *>;
  neighborTypes :List<*>;
  neighborsById :Map<string, *>;
  numberOfUtilizers :number;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
  results :List<*>;
  selectedEntitySet :?Map<*, *>;
  selectedEntitySetId :?UUID;
  selectedEntitySetSize :?number;
  unfilteredResults :List<*>;
};

class TopUtilizersEntitySetContainer extends React.Component<Props> {

  componentDidMount() {

    const {
      actions,
      entitySetsMetaData,
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
      selectedEntitySet,
      selectedEntitySetId,
    } = this.props;

    if (selectedEntitySetId && !selectedEntitySet) {
      actions.selectEntitySetById(selectedEntitySetId);
    }

    actions.updateFilteredTypes(
      this.getDefaultFilteredPropertyTypes({
        entitySetsMetaData,
        entityTypes,
        entityTypesIndexMap,
        propertyTypes,
        propertyTypesIndexMap,
        selectedEntitySet,
      })
    );
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.unmountTopUtilizers();
  }

  componentWillReceiveProps(nextProps :Props) {

    const { actions, selectedEntitySet } = this.props;
    const {
      entitySetsMetaData,
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
      unfilteredResults,
      selectedEntitySet: nextSelectedEntitySet
    } = nextProps;

    if (selectedEntitySet !== nextSelectedEntitySet) {
      actions.updateFilteredTypes(
        this.getDefaultFilteredPropertyTypes({
          entitySetsMetaData,
          entityTypes,
          entityTypesIndexMap,
          propertyTypes,
          propertyTypesIndexMap,
          selectedEntitySet: nextSelectedEntitySet,
        })
      );
      actions.reIndexEntitiesById(unfilteredResults);
      if (nextSelectedEntitySet) {
        actions.getNeighborTypes(nextSelectedEntitySet.get('id'));
      }
    }
  }

  getDefaultFilteredPropertyTypes = ({
    entitySetsMetaData,
    entityTypes,
    entityTypesIndexMap,
    propertyTypes,
    propertyTypesIndexMap,
    selectedEntitySet,
  } :Object) => {

    let result = Set();
    if (selectedEntitySet) {
      const entitySetId = selectedEntitySet.get('id');
      getEntitySetPropertyTypes({
        selectedEntitySet,
        entityTypes,
        entityTypesIndexMap,
        propertyTypes,
        propertyTypesIndexMap,
      }).forEach((propertyType) => {
        const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
        const propertyTypeId = propertyType.get('id');
        const shouldHide = entitySetsMetaData
          .getIn([entitySetId, propertyTypeId, 'propertyTags'], List())
          .includes(PROPERTY_TAGS.HIDE);
        if (shouldHide) {
          result = result.add(propertyTypeFQN);
        }
      });
    }

    return result;
  }

  onPropertyTypeChange = (e :any) => {
    const { value, checked } = e.target;
    const { actions, unfilteredResults } = this.props;
    let { filteredPropertyTypes } = this.props;

    if (checked) {
      filteredPropertyTypes = filteredPropertyTypes.delete(value);
    }
    else {
      filteredPropertyTypes = filteredPropertyTypes.add(value);
    }
    actions.updateFilteredTypes(filteredPropertyTypes);
    actions.reIndexEntitiesById(unfilteredResults);
  }

  renderResults = () => {
    const {
      countBreakdown,
      display,
      entityTypes,
      entityTypesIndexMap,
      filteredPropertyTypes,
      isLoadingResults,
      isLoadingResultCounts,
      neighborsById,
      locationsById,
      propertyTypes,
      propertyTypesIndexMap,
      results,
      lastQueryRun,
      selectedEntitySet,
      neighborTypes
    } = this.props;

    if (isLoadingResults) {
      return <LoadingSpinner />;
    }

    if (results.size && selectedEntitySet) {

      const entityTypeId :UUID = selectedEntitySet.get('entityTypeId');
      const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeId);
      const selectedEntityType :Map = entityTypes.get(entityTypeIndex, Map());

      switch (display) {

        case RESULT_DISPLAYS.DASHBOARD:
          return (
            <TopUtilizerDashboard
                countBreakdown={countBreakdown}
                entityTypes={entityTypes}
                entityTypesIndexMap={entityTypesIndexMap}
                neighborsById={neighborsById}
                propertyTypes={propertyTypes}
                propertyTypesIndexMap={propertyTypesIndexMap}
                results={results}
                selectedEntitySet={selectedEntitySet}
                selectedEntityType={selectedEntityType} />
          );

        case RESULT_DISPLAYS.RESOURCES:
          return (
            <TopUtilizerResources
                countBreakdown={countBreakdown}
                entityTypes={entityTypes}
                entityTypesIndexMap={entityTypesIndexMap}
                isLoading={isLoadingResultCounts}
                lastQueryRun={lastQueryRun}
                neighborsById={neighborsById}
                propertyTypes={propertyTypes}
                propertyTypesIndexMap={propertyTypesIndexMap}
                results={results}
                selectedEntityType={selectedEntityType} />
          );

        case RESULT_DISPLAYS.MAP:
          return (
            <TopUtilizerMap
                entityTypes={entityTypes}
                entityTypesIndexMap={entityTypesIndexMap}
                locationsById={locationsById}
                neighborTypes={neighborTypes}
                neighborsById={neighborsById}
                propertyTypes={propertyTypes}
                propertyTypesIndexMap={propertyTypesIndexMap}
                results={results}
                selectedEntitySet={selectedEntitySet} />
          );

        case RESULT_DISPLAYS.SEARCH_RESULTS:
        default:
          return (
            <SearchResultsContainer
                filteredPropertyTypes={filteredPropertyTypes}
                isTopUtilizers
                results={results}
                selectedEntitySet={selectedEntitySet} />
          );
      }
    }

    return null;
  }

  render() {
    const {
      actions,
      display,
      entityTypes,
      entityTypesIndexMap,
      filteredPropertyTypes,
      history,
      isLoadingNeighborTypes,
      neighborTypes,
      numberOfUtilizers,
      propertyTypes,
      propertyTypesIndexMap,
      results,
      selectedEntitySet,
      selectedEntitySetSize,
    } = this.props;

    return (
      <div>
        {
          selectedEntitySet
            ? (
              <TopUtilizerParameterSelection
                  display={display}
                  searchHasRun={!!results.size}
                  selectedEntitySet={selectedEntitySet}
                  selectedEntitySetSize={selectedEntitySetSize}
                  selectedEntitySetPropertyTypes={getEntitySetPropertyTypes(this.props)}
                  filteredPropertyTypes={filteredPropertyTypes}
                  isLoadingNeighborTypes={isLoadingNeighborTypes}
                  numberOfUtilizers={numberOfUtilizers}
                  neighborTypes={neighborTypes}
                  entityTypes={entityTypes}
                  entityTypesIndexMap={entityTypesIndexMap}
                  propertyTypes={propertyTypes}
                  propertyTypesIndexMap={propertyTypesIndexMap}
                  getTopUtilizers={actions.getTopUtilizers}
                  onPropertyTypeChange={this.onPropertyTypeChange}
                  changeTopUtilizersDisplay={actions.changeTopUtilizersDisplay}
                  changeNumUtilizers={actions.changeNumUtilizers}
                  deselectEntitySet={() => {
                    actions.clearTopUtilizersResults();
                    actions.selectEntitySet();
                    history.push(Routes.TOP_UTILIZERS);
                  }} />
            ) : <EntitySetSearch actionText="find to utilizers in" path={Routes.TOP_UTILIZERS} />
        }
        <ResultsWrapper>
          {this.renderResults()}
        </ResultsWrapper>
      </div>
    );
  }
}

function mapStateToProps(state :Map, props :Object) :Object {

  const {
    params: {
      id: selectedEntitySetId = null,
    } = {},
  } = props.match;

  const entitySets = state.get(STATE.ENTITY_SETS);
  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    selectedEntitySetId,
    entitySetsMetaData: state.getIn(['edm', 'entitySetsMetaData'], Map()),
    entityTypes: state.getIn(['edm', 'entityTypes'], List()),
    entityTypesIndexMap: state.getIn(['edm', 'entityTypesIndexMap'], Map()),
    propertyTypes: state.getIn(['edm', 'propertyTypes'], List()),
    propertyTypesIndexMap: state.getIn(['edm', 'propertyTypesIndexMap'], Map()),
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET),
    selectedEntitySetSize: entitySets.getIn([
      ENTITY_SETS.ENTITY_SET_SIZES,
      entitySets.getIn([ENTITY_SETS.SELECTED_ENTITY_SET, 'id'])
    ]),
    filteredPropertyTypes: explore.get(EXPLORE.FILTERED_PROPERTY_TYPES),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    locationsById: explore.get(EXPLORE.LOCATIONS_BY_ENTITY),
    display: topUtilizers.get(TOP_UTILIZERS.RESULT_DISPLAY),
    isLoadingNeighborTypes: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_NEIGHBOR_TYPES),
    neighborTypes: topUtilizers.get(TOP_UTILIZERS.NEIGHBOR_TYPES),
    numberOfUtilizers: topUtilizers.get(TOP_UTILIZERS.NUMBER_OF_UTILIZERS),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS),
    isLoadingResultCounts: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZER_NEIGHBORS),
    results: topUtilizers.get(TOP_UTILIZERS.TOP_UTILIZER_RESULTS),
    unfilteredResults: topUtilizers.get(TOP_UTILIZERS.UNFILTERED_TOP_UTILIZER_RESULTS),
    countBreakdown: topUtilizers.get(TOP_UTILIZERS.COUNT_BREAKDOWN),
    lastQueryRun: topUtilizers.get(TOP_UTILIZERS.LAST_QUERY_RUN)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EntitySetActions).forEach((action :string) => {
    actions[action] = EntitySetActions[action];
  });

  Object.keys(ExploreActionFactory).forEach((action :string) => {
    actions[action] = ExploreActionFactory[action];
  });

  Object.keys(TopUtilizersActionFactory).forEach((action :string) => {
    actions[action] = TopUtilizersActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopUtilizersEntitySetContainer));
