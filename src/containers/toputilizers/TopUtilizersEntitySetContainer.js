/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
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
  EDM,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { PROPERTY_TAGS } from '../../utils/constants/DataModelConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';
import { getFqnString, getEntitySetPropertyTypes } from '../../utils/DataUtils';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as TopUtilizersActionFactory from './TopUtilizersActionFactory';
import * as Routes from '../../core/router/Routes';

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
  entitySetPropertyMetadata :Map<string, *>;
  entityTypesById :Map<string, *>;
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
  propertyTypesByFqn :Map<string, *>;
  propertyTypesById :Map<string, *>;
  results :List<*>;
  selectedEntitySet :?Map<*, *>;
  selectedEntitySetId :string;
  selectedEntitySetSize :?number;
  unfilteredResults :List<*>;
};

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

class TopUtilizersEntitySetContainer extends React.Component<Props> {

  componentDidMount() {

    const {
      actions,
      entitySetPropertyMetadata,
      entityTypesById,
      propertyTypesById,
      selectedEntitySet,
      selectedEntitySetId,
    } = this.props;

    if (selectedEntitySetId && !selectedEntitySet) {
      actions.selectEntitySetById(selectedEntitySetId);
    }

    actions.updateFilteredTypes(
      this.getDefaultFilteredPropertyTypes({
        entitySetPropertyMetadata,
        entityTypesById,
        propertyTypesById,
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
      entitySetPropertyMetadata,
      entityTypesById,
      propertyTypesById,
      unfilteredResults,
      selectedEntitySet: nextSelectedEntitySet
    } = nextProps;

    if (selectedEntitySet !== nextSelectedEntitySet) {
      actions.updateFilteredTypes(
        this.getDefaultFilteredPropertyTypes({
          entitySetPropertyMetadata,
          entityTypesById,
          propertyTypesById,
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
    entitySetPropertyMetadata,
    entityTypesById,
    propertyTypesById,
    selectedEntitySet,
  } :Object) => {

    let result = Set();
    if (selectedEntitySet) {
      const entitySetId = selectedEntitySet.get('id');
      getEntitySetPropertyTypes({ selectedEntitySet, entityTypesById, propertyTypesById })
        .forEach((propertyType) => {
          const fqn = getFqnString(propertyType.get('type', Map()));
          const propertyTypeId = propertyType.get('id');
          const shouldHide = entitySetPropertyMetadata
            .getIn([entitySetId, propertyTypeId, 'propertyTags'], List())
            .includes(PROPERTY_TAGS.HIDE);
          if (shouldHide) {
            result = result.add(fqn);
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
      entityTypesById,
      filteredPropertyTypes,
      isLoadingResults,
      isLoadingResultCounts,
      neighborsById,
      locationsById,
      propertyTypesByFqn,
      propertyTypesById,
      results,
      lastQueryRun,
      selectedEntitySet,
      neighborTypes
    } = this.props;

    if (isLoadingResults) {
      return <LoadingSpinner />;
    }

    if (results.size && selectedEntitySet) {
      const selectedEntityType = entityTypesById.get(selectedEntitySet.get('entityTypeId', ''));

      switch (display) {

        case RESULT_DISPLAYS.DASHBOARD:
          return (
            <TopUtilizerDashboard
                entityTypesById={entityTypesById}
                propertyTypesById={propertyTypesById}
                propertyTypesByFqn={propertyTypesByFqn}
                selectedEntitySet={selectedEntitySet}
                selectedEntityType={selectedEntityType}
                neighborsById={neighborsById}
                results={results}
                countBreakdown={countBreakdown} />
          );

        case RESULT_DISPLAYS.RESOURCES:
          return (
            <TopUtilizerResources
                results={results}
                lastQueryRun={lastQueryRun}
                countBreakdown={countBreakdown}
                neighborsById={neighborsById}
                entityTypesById={entityTypesById}
                selectedEntityType={selectedEntityType}
                isLoading={isLoadingResultCounts}
                propertyTypesByFqn={propertyTypesByFqn}
                propertyTypesById={propertyTypesById} />
          );

        case RESULT_DISPLAYS.MAP:
          return (
            <TopUtilizerMap
                results={results}
                neighborTypes={neighborTypes}
                neighborsById={neighborsById}
                locationsById={locationsById}
                entityTypesById={entityTypesById}
                propertyTypesById={propertyTypesById}
                selectedEntitySet={selectedEntitySet} />
          );

        case RESULT_DISPLAYS.SEARCH_RESULTS:
        default:
          return (
            <SearchResultsContainer
                results={results}
                filteredPropertyTypes={filteredPropertyTypes}
                isTopUtilizers />
          );
      }
    }

    return null;
  }

  render() {
    const {
      actions,
      display,
      history,
      isLoadingNeighborTypes,
      neighborTypes,
      numberOfUtilizers,
      propertyTypesById,
      entityTypesById,
      filteredPropertyTypes,
      results,
      selectedEntitySet,
      selectedEntitySetSize
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
                  entityTypesById={entityTypesById}
                  propertyTypesById={propertyTypesById}
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

function mapStateToProps(state :Map<*, *>, ownProps :Object) :Object {
  const selectedEntitySetId = ownProps.match.params.id;

  const edm = state.get(STATE.EDM);
  const entitySets = state.get(STATE.ENTITY_SETS);
  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    selectedEntitySetId,
    entityTypesById: edm.get(EDM.ENTITY_TYPES_BY_ID),
    propertyTypesByFqn: edm.get(EDM.PROPERTY_TYPES_BY_FQN),
    propertyTypesById: edm.get(EDM.PROPERTY_TYPES_BY_ID),
    entitySetPropertyMetadata: edm.get(EDM.ENTITY_SET_METADATA_BY_ID),
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

  Object.keys(EntitySetActionFactory).forEach((action :string) => {
    actions[action] = EntitySetActionFactory[action];
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
