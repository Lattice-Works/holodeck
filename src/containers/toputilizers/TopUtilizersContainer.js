/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LoadingSpinner from '../../components/LoadingSpinner';
import EntitySetSearch from '../entitysets/EntitySetSearch';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import TopUtilizerResults from '../../components/toputilizers/TopUtilizerResults';
import {
  STATE,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as TopUtilizersActionFactory from './TopUtilizersActionFactory';

type Props = {
  selectedEntitySet :Map<*, *>,
  selectedEntitySetPropertyTypes :List<*>,
  isPersonType :boolean,
  breadcrumbs :List<string>,
  neighborsById :Map<string, *>,
  neighborTypes :List<*>,
  isLoadingResults :boolean,
  results :List<*>,
  actions :{
    clearTopUtilizers :() => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectBreadcrumb :(index :number) => void,
    selectEntity :(entityKeyId :string) => void,
    loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void,
    getTopUtilizers :() => void
  }
};

type State = {
  selectedPropertyTypes :List<*>
};

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

class TopUtilizersContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      selectedPropertyTypes: List()
    };
  }

  onPropertyTypeChange = (e) => {
    const propertyType = e.target.value;
    let { selectedPropertyTypes } = this.state;
    if (selectedPropertyTypes.includes(propertyType)) {
      selectedPropertyTypes = selectedPropertyTypes.remove(propertyType);
    }
    else {
      selectedPropertyTypes = selectedPropertyTypes.push(propertyType);
    }
    this.setState({ selectedPropertyTypes });
  }

  selectTopUtilizer = ({ entitySetId, entity }) => {
    const { actions, neighborsById } = this.props;
    const entityKeyId = getEntityKeyId(entity);
    actions.selectEntity(entityKeyId);
    if (!neighborsById.has(entityKeyId)) {
      actions.loadEntityNeighbors({ entitySetId, entity });
    }
  }

  renderResults = () => {
    const {
      actions,
      breadcrumbs,
      isLoadingResults,
      isPersonType,
      results,
      selectedEntitySet,
      selectedEntitySetPropertyTypes
    } = this.props;

    if (isLoadingResults) {
      return <LoadingSpinner />;
    }

    if (results.size) {
      return (
        <TopUtilizerResults
            backToResults={() => actions.selectBreadcrumb(0)}
            onUnmount={actions.clearTopUtilizers}
            results={results}
            isPersonType={isPersonType}
            entitySetId={selectedEntitySet.get('id')}
            propertyTypes={selectedEntitySetPropertyTypes}
            exploring={!!breadcrumbs.size}
            onSelectEntity={this.selectTopUtilizer} />
      );
    }
    return null;
  }

  render() {
    const {
      actions,
      entitySetSearchResults,
      neighborTypes,
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
                  selectedEntitySet={selectedEntitySet}
                  selectedEntitySetPropertyTypes={selectedEntitySetPropertyTypes}
                  selectedPropertyTypes={selectedPropertyTypes}
                  neighborTypes={neighborTypes}
                  getTopUtilizers={actions.getTopUtilizers}
                  onPropertyTypeChange={this.onPropertyTypeChange}
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
  const entitySets = state.get(STATE.ENTITY_SETS);
  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET),
    selectedEntitySetPropertyTypes: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET_PROPERTY_TYPES),
    isPersonType: entitySets.get(ENTITY_SETS.IS_PERSON_TYPE),
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    neighborTypes: topUtilizers.get(TOP_UTILIZERS.NEIGHBOR_TYPES),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS),
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
