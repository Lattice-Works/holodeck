/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, Set } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownload } from '@fortawesome/pro-light-svg-icons';

import EntitySetSearch from '../entitysets/EntitySetSearch';
import SearchResultsContainer from '../explore/SearchResultsContainer';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import TopUtilizerDashboard from '../../components/toputilizers/TopUtilizerDashboard';
import TopUtilizerResources from '../../components/toputilizers/TopUtilizerResources';
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
  selectedEntitySetId :string,
  countBreakdown :Map<*, *>,
  selectedEntitySet :?Map<*, *>,
  selectedEntitySetSize :?number,
  neighborsById :Map<string, *>,
  entityTypesById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  entitySetPropertyMetadata :Map<string, *>,
  filteredPropertyTypes :Set<string>,
  isLoadingNeighborTypes :boolean,
  neighborTypes :List<*>,
  display :string,
  isDownloading :boolean,
  isLoadingResults :boolean,
  isLoadingResultCounts :boolean,
  results :List<*>,
  unfilteredResults :List<*>,
  lastQueryRun :string,
  actions :{
    downloadTopUtilizers :({ name :string, results :Map<*, *> }) => void,
    changeTopUtilizersDisplay :(display :string) => void,
    clearTopUtilizersResults :() => void,
    unmountTopUtilizers :() => void,
    selectEntitySet :(entitySet? :Map<*, *>) => void,
    selectEntity :(entityKeyId :string) => void,
    selectBreadcrumb :(index :number) => void,
    loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void,
    getTopUtilizers :() => void,
    updateFilteredTypes :(filteredTypes :Set<*>) => void,
    reIndexEntitiesById :(unfilteredTopUtilizerResults :List<*>) => void,
    getNeighborTypes :(id :string) => void
  }
};

const ResultsWrapper = styled.div`
  margin: 30px 0;
`;

const CenteredRow = styled.div`
  width: 100%;
  margin: 30px 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const DownloadButton = styled(SecondaryButton)`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    margin-left: 7px;
  }
`;

class TopUtilizersEntitySetContainer extends React.Component<Props> {

  componentDidMount() {
    const { actions, selectedEntitySet, selectedEntitySetId } = this.props;

    if (selectedEntitySetId && !selectedEntitySet) {
      actions.selectEntitySetById(selectedEntitySetId);
    }

    actions.updateFilteredTypes(this.getDefaultFilteredPropertyTypes(this.props));
  }

  componentWillUnmount() {
    const { actions } = this.props;
    actions.unmountTopUtilizers();
  }

  componentWillReceiveProps(nextProps) {
    const { actions, selectedEntitySet } = this.props;
    if (selectedEntitySet !== nextProps.selectedEntitySet) {
      actions.updateFilteredTypes(this.getDefaultFilteredPropertyTypes(nextProps));
      actions.reIndexEntitiesById(nextProps.unfilteredResults);

      if (nextProps.selectedEntitySet) {
        actions.getNeighborTypes(nextProps.selectedEntitySet.get('id'));
      }
    }
  }

  getDefaultFilteredPropertyTypes = (props :Props) => {
    const { entitySetPropertyMetadata, selectedEntitySet } = props;
    let result = Set();
    if (selectedEntitySet) {
      const entitySetId = selectedEntitySet.get('id');
      getEntitySetPropertyTypes(props).forEach((propertyType) => {
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

  onPropertyTypeChange = (e) => {
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
      propertyTypesByFqn,
      propertyTypesById,
      results,
      lastQueryRun,
      selectedEntitySet
    } = this.props;

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

  download = () => {
    const {
      actions,
      entityTypesById,
      propertyTypesById,
      selectedEntitySet,
      results
    } = this.props;
    if (selectedEntitySet && results.size) {
      const name = `${selectedEntitySet.get('title')} - Top Utilizers`;
      const fields = entityTypesById
        .getIn([selectedEntitySet.get('entityTypeId'), 'properties'], List())
        .map(id => getFqnString(propertyTypesById.getIn([id, 'type'])));
      actions.downloadTopUtilizers({ name, fields, results });
    }
  }

  render() {
    const {
      actions,
      display,
      isDownloading,
      isLoadingNeighborTypes,
      neighborTypes,
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
            ) : <EntitySetSearch actionText="find to utilizers in" path={Routes.TOP_UTILIZERS} />
        }
        <ResultsWrapper>
          {this.renderResults()}
        </ResultsWrapper>
        {
          results.size
            ? (
              <CenteredRow>
                <DownloadButton onClick={this.download} disabled={isDownloading}>
                  <FontAwesomeIcon icon={faCloudDownload} />
                  <span>Download as CSV</span>
                </DownloadButton>
              </CenteredRow>
            )
            : null
        }
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
    display: topUtilizers.get(TOP_UTILIZERS.RESULT_DISPLAY),
    isDownloading: topUtilizers.get(TOP_UTILIZERS.IS_DOWNLOADING_TOP_UTILIZERS),
    isLoadingNeighborTypes: topUtilizers.get(TOP_UTILIZERS.IS_LOADING_NEIGHBOR_TYPES),
    neighborTypes: topUtilizers.get(TOP_UTILIZERS.NEIGHBOR_TYPES),
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
