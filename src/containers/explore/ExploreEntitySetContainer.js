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
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SearchParameterSelection from '../../components/explore/SearchParameterSelection';
import {
  STATE,
  // ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import * as ExploreActions from './ExploreActionFactory';
import * as TopUtilizersActions from '../toputilizers/TopUtilizersActionFactory';
import * as Routes from '../../core/router/Routes';
import * as RoutingActions from '../../core/router/RoutingActions';
import { AppContentWrapper } from '../../components/layout';
import { isValidUUID } from '../../utils/ValidationUtils';
import type { GoToRoot, GoToRoute } from '../../core/router/RoutingActions';

type Props = {
  actions :{
    clearExploreSearchResults :RequestSequence;
    getNeighborTypes :RequestSequence;
    goToRoot :GoToRoot;
    goToRoute :GoToRoute;
    searchEntitySetData :RequestSequence;
    unmountExplore :RequestSequence;
  };
  isLoadingResults :boolean;
  results :List<*>;
  selectedEntitySet :Map<*, *>;
  selectedEntitySetId :string;
  selectedEntitySetSize :?number;
};

type State = {
  currLayout :string;
  searchStart :number;
  searchTerm :string;
};

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

class ExploreEntitySetContainer extends React.Component<Props, State> {

  constructor(props :Props) {
    super(props);
    this.state = {
      searchTerm: '',
      searchStart: 0,
      currLayout: ''
    };
  }

  componentDidMount() {

    const { actions, selectedEntitySetId } = this.props;

    if (!isValidUUID(selectedEntitySetId)) {
      actions.goToRoot();
    }
  }

  componentDidUpdate() {

    const { actions, selectedEntitySetId } = this.props;
    if (!isValidUUID(selectedEntitySetId)) {
      actions.goToRoot();
    }
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
      return (
        <SearchResultsContainer
            searchStart={searchStart}
            currLayout={currLayout}
            results={results.get('hits', List())}
            totalHits={results.get('numHits')}
            executeSearch={this.executeSearch}
            renderLayout={this.renderLayout} />
      );
    }

    return null;
  }

  onSearchTermChange = (e :any) => {
    const { value } = e.target;
    this.setState({ searchTerm: value });
  }

  executeSearch = (startVal) => {
    const { searchTerm } = this.state;
    const { actions, selectedEntitySet } = this.props;

    if (selectedEntitySet) {

      let start = startVal;

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

  }

  renderLayout = (layout) => {
    this.setState({
      currLayout: layout
    });
  }

  deselectEntitySet = () => {

    const { actions } = this.props;
    actions.goToRoute(Routes.EXPLORE);
  }

  render() {
    const {
      selectedEntitySet,
      selectedEntitySetSize
    } = this.props;
    const { searchTerm } = this.state;

    if (!selectedEntitySet) {
      return (
        <LoadingSpinner />
      );
    }

    return (
      <>
        <AppContentWrapper>
          <SearchParameterSelection
              selectedEntitySet={selectedEntitySet}
              selectedEntitySetSize={selectedEntitySetSize}
              deselectEntitySet={this.deselectEntitySet}
              onChange={this.onSearchTermChange}
              executeSearch={this.executeSearch}
              searchTerm={searchTerm} />
        </AppContentWrapper>
        <ResultsWrapper>
          {this.renderResults()}
        </ResultsWrapper>
      </>
    );
  }
}


function mapStateToProps(state :Map<*, *>, props :Object) :Object {

  const {
    params: {
      id: selectedEntitySetId = null,
    } = {},
  } = props.match;

  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);

  const entitySets = state.getIn(['edm', 'entitySets'], List());
  const entitySetsIndexMap = state.getIn(['edm', 'entitySetsIndexMap'], List());
  const selectedEntitySetIndex = entitySetsIndexMap.get(selectedEntitySetId);
  const selectedEntitySet = entitySets.get(selectedEntitySetIndex);

  return {
    selectedEntitySet,
    selectedEntitySetId,
    // selectedEntitySetSize: entitySets.getIn([
    //   ENTITY_SETS.ENTITY_SET_SIZES,
    //   entitySets.getIn([ENTITY_SETS.SELECTED_ENTITY_SET, 'id'])
    // ]),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS)
  };
}

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    clearExploreSearchResults: ExploreActions.clearExploreSearchResults,
    getNeighborTypes: TopUtilizersActions.getNeighborTypes,
    goToRoot: RoutingActions.goToRoot,
    goToRoute: RoutingActions.goToRoute,
    searchEntitySetData: ExploreActions.searchEntitySetData,
    unmountExplore: ExploreActions.unmountExplore,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapActionsToProps)(ExploreEntitySetContainer));
