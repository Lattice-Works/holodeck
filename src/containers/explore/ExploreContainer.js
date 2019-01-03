/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SearchResultsContainer from './SearchResultsContainer';
import EntitySetSearch from '../entitysets/EntitySetSearch';
import LoadingSpinner from '../../components/LoadingSpinner';
import SearchParameterSelection from '../../components/explore/SearchParameterSelection';
import {
  STATE,
  EDM,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { PAGE_SIZE } from '../../utils/constants/ExploreConstants';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as TopUtilizersActionFactory from '../toputilizers/TopUtilizersActionFactory';

type Props = {
  countBreakdown :Map<*, *>,
  selectedEntitySet :Map<*, *>,
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
  results :List<*>,
  selectedEntitySetSize :?number,
  actions :{
    changeTopUtilizersDisplay :(display :string) => void,
    unmountTopUtilizers :() => void,
    searchEntitySetData :({ searchTerm :string, start :number, entitySetId :string }) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntity :(entityKeyId :string) => void,
    loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void,
    getTopUtilizers :() => void,
    unmountExplore :() => void,
    clearExploreSearchResults :() => void
  }
};

type State = {
  searchTerm :string,
  searchStart :number,
  currLayout :string
};

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

class ExploreContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: '',
      searchStart: 0,
      currLayout: ''
    };
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.unmountExplore();
  }

  renderResults = () => {
    const { isLoadingResults, results } = this.props;
    const { searchStart, currLayout } = this.state;

    if (isLoadingResults) {
      return <LoadingSpinner />;
    }

    if (results.size) {
      return <SearchResultsContainer
                searchStart={searchStart}
                currLayout={currLayout}
                results={results.get('hits', List())}
                totalHits={results.get('numHits')}
                executeSearch={this.executeSearch}
                renderLayout={this.renderLayout} />;
    }

    return null;
  }

  onSearchTermChange = (e) => {
    const { value } = e.target;
    this.setState({ searchTerm: value });
  }

  executeSearch = (start) => {
    const { searchTerm } = this.state;
    const { actions, selectedEntitySet } = this.props;

    if (!start || typeof start !== 'number') {
      start = 0;
    }

    this.setState({
      searchStart: start
    });

    actions.searchEntitySetData({
      entitySetId: selectedEntitySet.get('id'),
      start,
      searchTerm
    });
  }

  renderLayout = (layout) => {
    this.setState({
      currLayout: layout
    });
  }

  render() {
    const { actions, selectedEntitySet, selectedEntitySetSize } = this.props;
    const { searchTerm } = this.state;

    return (
      <div>
        {
          selectedEntitySet
            ? (
              <SearchParameterSelection
                  selectedEntitySet={selectedEntitySet}
                  selectedEntitySetSize={selectedEntitySetSize}
                  deselectEntitySet={() => {
                    actions.clearExploreSearchResults();
                    actions.selectEntitySet();
                  }}
                  onChange={this.onSearchTermChange}
                  executeSearch={this.executeSearch}
                  searchTerm={searchTerm} />
            )
            : <EntitySetSearch actionText="search" />
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
    selectedEntitySetSize: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET_SIZE),
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    display: topUtilizers.get(TOP_UTILIZERS.RESULT_DISPLAY),
    neighborTypes: topUtilizers.get(TOP_UTILIZERS.NEIGHBOR_TYPES),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS),
    isLoadingResultCounts: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZER_NEIGHBORS),
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreContainer));
