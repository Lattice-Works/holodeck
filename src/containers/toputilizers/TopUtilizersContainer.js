/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LoadingSpinner from '../../components/LoadingSpinner';
import EntitySetSearch from '../entitysets/EntitySetSearch';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import TopUtilizerSearchResults from '../../components/toputilizers/TopUtilizerSearchResults';
import TopUtilizerDashboard from '../../components/toputilizers/TopUtilizerDashboard';
import TopUtilizerResouces from '../../components/toputilizers/TopUtilizerResources';
import {
  STATE,
  EDM,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { DEFAULT_IGNORE_PROPERTY_TYPES, DEFAULT_PERSON_PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { RESULT_DISPLAYS } from '../../utils/constants/TopUtilizerConstants';
import { getEntityKeyId, getFqnString } from '../../utils/DataUtils';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as TopUtilizersActionFactory from './TopUtilizersActionFactory';

type Props = {
  selectedEntitySet :Map<*, *>,
  selectedEntitySetPropertyTypes :List<*>,
  isPersonType :boolean,
  breadcrumbs :List<string>,
  neighborsById :Map<string, *>,
  entityTypesById :Map<string, *>,
  entitySetsById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  neighborTypes :List<*>,
  display :string,
  isLoadingResults :boolean,
  isLoadingResultCounts :boolean,
  detailedCounts :Map<*, *>,
  results :List<*>,
  actions :{
    changeTopUtilizersDisplay :(display :string) => void,
    clearTopUtilizers :() => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntity :(entityKeyId :string) => void,
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

  componentWillReceiveProps(nextProps) {
    const { isPersonType, selectedEntitySetPropertyTypes } = this.props;
    if (isPersonType !== nextProps.isPersonType
      || (!selectedEntitySetPropertyTypes.size && nextProps.selectedEntitySetPropertyTypes.size)) {
      this.setState({ selectedPropertyTypes: this.getDefaultSelectedPropertyTypes(nextProps) });
    }
  }

  getDefaultSelectedPropertyTypes = ({ isPersonType, selectedEntitySetPropertyTypes }) => {
    let result = Set();
    selectedEntitySetPropertyTypes.forEach((propertyType) => {
      const fqn = getFqnString(propertyType.get('type'));
      const shouldIgnore = DEFAULT_IGNORE_PROPERTY_TYPES.includes(fqn);
      const shouldExcludeForPerson = isPersonType && !DEFAULT_PERSON_PROPERTY_TYPES.includes(fqn);
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
      breadcrumbs,
      detailedCounts,
      display,
      entityTypesById,
      isLoadingResults,
      isLoadingResultCounts,
      isPersonType,
      neighborsById,
      propertyTypesByFqn,
      propertyTypesById,
      results,
      selectedEntitySet,
      selectedEntitySetPropertyTypes
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
                selectedEntityType={selectedEntityType}
                detailedCounts={detailedCounts}
                isLoading={isLoadingResultCounts} />
          );

        case RESULT_DISPLAYS.RESOURCES:
          return (
            <TopUtilizerResouces
                results={results}
                neighborsById={neighborsById}
                entityTypesById={entityTypesById}
                selectedEntityType={selectedEntityType}
                detailedCounts={detailedCounts}
                isLoading={isLoadingResultCounts}
                propertyTypesByFqn={propertyTypesByFqn}
                propertyTypesById={propertyTypesById} />
          );

        case RESULT_DISPLAYS.SEARCH_RESULTS:
        default:
          return (
            <TopUtilizerSearchResults
                results={results}
                selectedPropertyTypes={selectedPropertyTypes}
                isPersonType={isPersonType}
                entitySetId={selectedEntitySet.get('id')}
                propertyTypes={selectedEntitySetPropertyTypes}
                exploring={!!breadcrumbs.size}
                onSelectEntity={this.selectTopUtilizer} />
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
      results,
      selectedEntitySet,
      selectedEntitySetPropertyTypes
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
                  selectedEntitySetPropertyTypes={selectedEntitySetPropertyTypes}
                  selectedPropertyTypes={selectedPropertyTypes}
                  neighborTypes={neighborTypes}
                  getTopUtilizers={actions.getTopUtilizers}
                  onPropertyTypeChange={this.onPropertyTypeChange}
                  changeTopUtilizersDisplay={actions.changeTopUtilizersDisplay}
                  deselectEntitySet={() => {
                    actions.clearTopUtilizers();
                    actions.selectEntitySet({ entitySet: undefined, propertyTypes: List() });
                  }} />
            ) : <EntitySetSearch />
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
    selectedEntitySetPropertyTypes: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET_PROPERTY_TYPES),
    isPersonType: entitySets.get(ENTITY_SETS.IS_PERSON_TYPE),
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    display: topUtilizers.get(TOP_UTILIZERS.RESULT_DISPLAY),
    neighborTypes: topUtilizers.get(TOP_UTILIZERS.NEIGHBOR_TYPES),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS),
    isLoadingResultCounts: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZER_NEIGHBORS),
    detailedCounts: topUtilizers.get(TOP_UTILIZERS.TOP_UTILIZER_NEIGHBOR_DETAILS),
    results: topUtilizers.get(TOP_UTILIZERS.TOP_UTILIZER_RESULTS)
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
