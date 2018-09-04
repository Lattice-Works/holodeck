/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LoadingSpinner from '../../components/LoadingSpinner';
import EntitySetSearch from '../entitysets/EntitySetSearch';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import TopUtilizerResults from '../../components/toputilizers/TopUtilizerResults';
import { STATE, ENTITY_SETS, TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';
import * as TopUtilizersActionFactory from './TopUtilizersActionFactory';

type Props = {
  selectedEntitySet :Map<*, *>,
  selectedEntitySetPropertyTypes :List<*>,
  isPersonType :boolean,
  neighborTypes :List<*>,
  isLoadingResults :boolean,
  results :List<*>,
  actions :{
    selectEntitySet :(entitySet? :Map<*, *>) => void,
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

  renderResults = () => {
    const { isLoadingResults, isPersonType, results } = this.props;

    if (isLoadingResults) {
      return <LoadingSpinner />;
    }

    if (results.size) {
      return (
        <TopUtilizerResults results={results} isPersonType={isPersonType} />
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
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET),
    selectedEntitySetPropertyTypes: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET_PROPERTY_TYPES),
    isPersonType: entitySets.get(ENTITY_SETS.IS_PERSON_TYPE),
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
