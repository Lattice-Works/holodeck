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
import LoadingSpinner from '../../components/LoadingSpinner';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import TopUtilizerDashboard from '../../components/toputilizers/TopUtilizerDashboard';
import TopUtilizerResouces from '../../components/toputilizers/TopUtilizerResources';
import {
  STATE,
  EDM,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import {
  DEFAULT_IGNORE_PROPERTY_TYPES,
  DEFAULT_PERSON_PROPERTY_TYPES
} from '../../utils/constants/DataModelConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';
import {
  getEntityKeyId,
  getFqnString,
  getEntitySetPropertyTypes,
  isPersonType
} from '../../utils/DataUtils';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as TopUtilizersActionFactory from './TopUtilizersActionFactory';

type Props = {
  countBreakdown :Map<*, *>,
  selectedEntitySet :Map<*, *>,
  neighborsById :Map<string, *>,
  entityTypesById :Map<string, *>,
  entitySetsById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  neighborTypes :List<*>,
  display :string,
  isLoadingResults :boolean,
  isLoadingResultCounts :boolean,
  results :List<*>,
  actions :{
    changeTopUtilizersDisplay :(display :string) => void,
    clearTopUtilizersResults :() => void,
    unmountTopUtilizers :() => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntity :(entityKeyId :string) => void,
    selectBreadcrumb :(index :number) => void,
    loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void,
    getTopUtilizers :() => void
  }
};

type State = {
  selectedPropertyTypes :Set<*>
};

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

class TopUtilizersContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      selectedPropertyTypes: this.getDefaultSelectedPropertyTypes(props)
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.unmountTopUtilizers();
  }

  componentWillReceiveProps(nextProps) {
    const { selectedEntitySet } = this.props;
    if (isPersonType(this.props) !== isPersonType(nextProps) || (selectedEntitySet !== nextProps.selectedEntitySet)) {
      this.setState({ selectedPropertyTypes: this.getDefaultSelectedPropertyTypes(nextProps) });
    }
  }

  getDefaultSelectedPropertyTypes = (props :Props) => {
    let result = Set();
    getEntitySetPropertyTypes(props).forEach((propertyType) => {
      const fqn = getFqnString(propertyType.get('type', Map()));
      const shouldIgnore = DEFAULT_IGNORE_PROPERTY_TYPES.includes(fqn);
      const shouldExcludeForPerson = isPersonType(props) && !DEFAULT_PERSON_PROPERTY_TYPES.includes(fqn);
      if (!shouldIgnore && !shouldExcludeForPerson) {
        result = result.add(propertyType.get('id'));
      }
    });

    return result;
  }

  onPropertyTypeChange = (e) => {
    const { value, checked } = e.target;
    let { selectedPropertyTypes } = this.state;
    if (checked) {
      selectedPropertyTypes = selectedPropertyTypes.add(value);
    }
    else {
      selectedPropertyTypes = selectedPropertyTypes.delete(value);
    }
    this.setState({ selectedPropertyTypes });
  }

  selectTopUtilizer = ({ entitySetId, entity }) => {
    const {
      actions,
      entitySetsById,
      entityTypesById,
      neighborsById
    } = this.props;
    const entityKeyId = getEntityKeyId(entity);
    const entityType = entityTypesById.get(entitySetsById.getIn([entitySetId, 'entityTypeId'], ''), Map());
    actions.selectEntity({ entityKeyId, entitySetId, entityType });
    if (!neighborsById.has(entityKeyId)) {
      actions.loadEntityNeighbors({ entitySetId, entity });
    }
  }

  renderResults = () => {
    const {
      countBreakdown,
      display,
      entityTypesById,
      isLoadingResults,
      isLoadingResultCounts,
      neighborsById,
      propertyTypesByFqn,
      propertyTypesById,
      results,
      selectedEntitySet
    } = this.props;

    const { selectedPropertyTypes } = this.state;

    if (isLoadingResults) {
      return <LoadingSpinner />;
    }

    if (results.size) {
      const selectedEntityType = entityTypesById.get(selectedEntitySet.get('entityTypeId', ''));

      switch (display) {

        case RESULT_DISPLAYS.DASHBOARD:
          return (
            <TopUtilizerDashboard
                entityTypesById={entityTypesById}
                propertyTypesById={propertyTypesById}
                selectedEntityType={selectedEntityType}
                countBreakdown={countBreakdown} />
          );

        case RESULT_DISPLAYS.RESOURCES:
          return (
            <TopUtilizerResouces
                results={results}
                countBreakdown={countBreakdown}
                neighborsById={neighborsById}
                entityTypesById={entityTypesById}
                selectedEntityType={selectedEntityType}
                isLoading={isLoadingResultCounts}
                propertyTypesByFqn={propertyTypesByFqn}
                propertyTypesById={propertyTypesById} />
          );

        case RESULT_DISPLAYS.SEARCH_RESULTS:
        default:
          return (
            <SearchResultsContainer
                results={results}
                filteredPropertyTypes={selectedPropertyTypes}
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
      neighborTypes,
      propertyTypesById,
      entityTypesById,
      results,
      selectedEntitySet
    } = this.props;

    const { selectedPropertyTypes } = this.state;

    return (
      <div>
        {
          selectedEntitySet
            ? (
              <TopUtilizerParameterSelection
                  display={display}
                  searchHasRun={!!results.size}
                  selectedEntitySet={selectedEntitySet}
                  selectedEntitySetPropertyTypes={getEntitySetPropertyTypes(this.props)}
                  selectedPropertyTypes={selectedPropertyTypes}
                  neighborTypes={neighborTypes}
                  entityTypesById={entityTypesById}
                  propertyTypesById={propertyTypesById}
                  getTopUtilizers={actions.getTopUtilizers}
                  onPropertyTypeChange={this.onPropertyTypeChange}
                  changeTopUtilizersDisplay={actions.changeTopUtilizersDisplay}
                  deselectEntitySet={() => {
                    actions.clearTopUtilizersResults();
                    actions.selectEntitySet();
                  }} />
            ) : <EntitySetSearch actionText="find to utilizers in" />
        }
        <ResultsWrapper>
          {this.renderResults()}
        </ResultsWrapper>
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const edm = state.get(STATE.EDM);
  const entitySets = state.get(STATE.ENTITY_SETS);
  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    entityTypesById: edm.get(EDM.ENTITY_TYPES_BY_ID),
    entitySetsById: edm.get(EDM.ENTITY_SETS_BY_ID),
    propertyTypesByFqn: edm.get(EDM.PROPERTY_TYPES_BY_FQN),
    propertyTypesById: edm.get(EDM.PROPERTY_TYPES_BY_ID),
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    display: topUtilizers.get(TOP_UTILIZERS.RESULT_DISPLAY),
    neighborTypes: topUtilizers.get(TOP_UTILIZERS.NEIGHBOR_TYPES),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS),
    isLoadingResultCounts: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZER_NEIGHBORS),
    results: topUtilizers.get(TOP_UTILIZERS.TOP_UTILIZER_RESULTS),
    countBreakdown: topUtilizers.get(TOP_UTILIZERS.COUNT_BREAKDOWN)
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopUtilizersContainer));
