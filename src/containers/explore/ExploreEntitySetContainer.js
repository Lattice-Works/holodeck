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
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as TopUtilizersActionFactory from '../toputilizers/TopUtilizersActionFactory';
import * as Routes from '../../core/router/Routes';

type Props = {
  selectedEntitySetId :string,
  isLoadingResults :boolean,
  selectedEntitySet :Map<*, *>,
  results :List<*>,
  selectedEntitySetSize :?number,
  history :string[],
  actions :{
    searchEntitySetData :({ searchTerm :string, start :number, entitySetId :string }) => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntity :(entityKeyId :string) => void,
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
    const { actions, selectedEntitySet, selectedEntitySetId } = this.props;
    if (selectedEntitySetId && !selectedEntitySet) {
      actions.selectEntitySetById(selectedEntitySetId);
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

  onSearchTermChange = (e) => {
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

  render() {
    const {
      actions,
      history,
      selectedEntitySet,
      selectedEntitySetSize
    } = this.props;
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
                    history.push(Routes.EXPLORE);
                  }}
                  onChange={this.onSearchTermChange}
                  executeSearch={this.executeSearch}
                  searchTerm={searchTerm} />
            )
            : <LoadingSpinner />
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

  const entitySets = state.get(STATE.ENTITY_SETS);
  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    selectedEntitySetId,
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET),
    selectedEntitySetSize: entitySets.getIn([
      ENTITY_SETS.ENTITY_SET_SIZES,
      entitySets.getIn([ENTITY_SETS.SELECTED_ENTITY_SET, 'id'])
    ]),
    results: explore.get(EXPLORE.SEARCH_RESULTS),
    isLoadingResults: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_TOP_UTILIZERS)
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExploreEntitySetContainer));
