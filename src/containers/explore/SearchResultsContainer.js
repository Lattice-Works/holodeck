/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';
import { Models } from 'lattice';
import { CardStack } from 'lattice-ui-kit';

import PersonResultCard from '../../components/people/PersonResultCard';
import ButtonToolbar from '../../components/buttons/ButtonToolbar';
import SubtleButton from '../../components/buttons/SubtleButton';
import DataTable from '../../components/data/DataTable';
import EntityDetails from '../data/EntityDetails';
import Pagination from '../../components/explore/Pagination';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { IMAGE_PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { STATE, EXPLORE, TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import { getEntityKeyId, isPersonType } from '../../utils/DataUtils';
import * as ExploreActionFactory from './ExploreActionFactory';
import * as TopUtilizersActionFactory from '../toputilizers/TopUtilizersActionFactory';

const { FullyQualifiedName } = Models;

const ToolbarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SubtleButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;

  ${SubtleButton}:not(:first-child) {
    margin-left: 10px;
  }

`;

const NumResults = styled.div`
  font-size: 12px;
  line-height: normal;
  color: #8e929b;
  margin-left: ${(props) => (props.withMargin ? 30 : 0)}px;
`;

const LAYOUTS = {
  PERSON: 'PERSON',
  TABLE: 'TABLE'
};

const MAX_RESULTS = 20;

type Props = {
  actions :{
    selectEntity :(obj :Object) => void;
    loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void;
    downloadTopUtilizers :({ name :string, results :Map<*, *> }) => void;
  };
  breadcrumbs :List<string>;
  countBreakdown :Map<*, *>;
  currLayout ?:string;
  entityTypes :List;
  entityTypesIndexMap :Map;
  executeSearch :Function;
  filteredPropertyTypes ?:Set<string>;
  isDownloadingTopUtilizers :boolean;
  isTopUtilizers :boolean;
  neighborsById :Map<string, *>;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
  renderLayout :Function;
  results :List<*>;
  searchStart ?:number;
  selectedEntitySet :Map;
  totalHits :number;
};

type State = {
  layout :string;
  showCountDetails :boolean;
  start :number;
};

class SearchResultsContainer extends React.Component<Props, State> {

  static defaultProps = {
    currLayout: undefined,
    filteredPropertyTypes: Set(),
    searchStart: 0,
  };

  constructor(props :Props) {
    super(props);
    this.state = {
      layout: isPersonType(props) ? LAYOUTS.PERSON : LAYOUTS.TABLE,
      showCountDetails: false,
      start: 0
    };
  }

  updateLayout = (layout) => this.setState({ layout });

  onSelect = (index, entity) => {
    const {
      actions,
      entityTypes,
      entityTypesIndexMap,
      neighborsById,
      propertyTypes,
      propertyTypesIndexMap,
      selectedEntitySet,
    } = this.props;

    const entityKeyId = getEntityKeyId(entity);
    const entitySetId = selectedEntitySet.get('id');
    const selectedEntitySetId = entitySetId;
    const entityTypeId :UUID = selectedEntitySet.get('entityTypeId');
    const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeId);
    const entityType = entityTypes.get(entityTypeIndex, Map());
    actions.selectEntity({
      entityKeyId,
      entitySetId,
      entityType,
      propertyTypes,
      propertyTypesIndexMap,
    });
    if (!neighborsById.has(entityKeyId)) {
      actions.loadEntityNeighbors({ entitySetId, entity, selectedEntitySetId });
    }
  };

  getCountsForUtilizer = (entityKeyId) => {

    const {
      countBreakdown,
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
    } = this.props;

    const getEntityTypeTitle = (id) => {
      const entityTypeIndex :number = entityTypesIndexMap.get(id);
      return entityTypes.getIn([entityTypeIndex, 'title'], '');
    };

    return countBreakdown.get(entityKeyId, Map()).entrySeq()
      .filter(([pair]) => pair !== 'score')
      .flatMap(([pair, pairMap]) => {
        const pairTitle = `${getEntityTypeTitle(pair.get(0))} ${getEntityTypeTitle(pair.get(1))}`;
        return pairMap.entrySeq().map(([key, count]) => {
          const propertyTypeIndex = propertyTypesIndexMap.get(key);
          const propertyType = propertyTypes.get(propertyTypeIndex, Map());
          const propertyTypeTitle = propertyType.get('title');
          const title = key === COUNT_FQN
            ? pairTitle
            : `${pairTitle} -- ${propertyTypeTitle}`;
          return Map().set(TOP_UTILIZERS_FILTER.LABEL, title).set(COUNT_FQN, count);
        });
      });
  }

  renderPersonResults = () => {
    const { isTopUtilizers, results } = this.props;
    const { showCountDetails, start } = this.state;

    return (
      <CardStack>
        {
          results.map((person, index) => (
            <PersonResultCard
                key={getEntityKeyId(person)}
                counts={isTopUtilizers && showCountDetails ? this.getCountsForUtilizer(getEntityKeyId(person)) : null}
                index={index + 1 + start}
                person={person}
                onClick={() => this.onSelect(index, person)} />
          ))
        }
      </CardStack>
    );
  }

  renderTableResults = () => {
    const {
      entityTypes,
      entityTypesIndexMap,
      filteredPropertyTypes,
      isTopUtilizers,
      propertyTypes,
      propertyTypesIndexMap,
      results,
      selectedEntitySet
    } = this.props;

    let propertyTypeHeaders = List();

    if (isTopUtilizers) {
      propertyTypeHeaders = propertyTypeHeaders.push(fromJS({
        id: COUNT_FQN,
        value: 'Score'
      }));
    }

    const entityTypeId :UUID = selectedEntitySet.get('entityTypeId');
    const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeId);
    const entityType :Map = entityTypes.get(entityTypeIndex, Map());
    const targetPropertyTypes = entityType
      .get('properties', List())
      .map((propertyTypeId :UUID) => {
        const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
        return propertyTypes.get(propertyTypeIndex, Map());
      });

    targetPropertyTypes.forEach((propertyType :Map) => {
      const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
      const value = propertyType.get('title');
      if (filteredPropertyTypes && !filteredPropertyTypes.has(propertyTypeFQN)) {
        const isImg = IMAGE_PROPERTY_TYPES.includes(propertyTypeFQN);
        propertyTypeHeaders = propertyTypeHeaders.push(fromJS({ id: propertyTypeFQN, value, isImg }));
      }
    });

    return (
      <DataTable headers={propertyTypeHeaders} data={results} onRowClick={this.onSelect} />
    );
  };

  downloadTopUtilizers = () => {
    const {
      actions,
      entityTypes,
      entityTypesIndexMap,
      propertyTypes,
      propertyTypesIndexMap,
      selectedEntitySet,
      results
    } = this.props;
    if (selectedEntitySet && results.size) {
      const name = `${selectedEntitySet.get('title')} - Top Utilizers`;
      const entityTypeId :UUID = selectedEntitySet.get('entityTypeId');
      const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeId);
      const entityType = entityTypes.get(entityTypeIndex, Map());
      const fields = entityType
        .get('properties', List())
        .map((propertyTypeId :UUID) => {
          const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
          const propertyType = propertyTypes.get(propertyTypeIndex, Map());
          return FullyQualifiedName.toString(propertyType.get('type', Map()));
        });
      actions.downloadTopUtilizers({ name, fields, results });
    }
  }

  renderLayoutToolbar = () => {
    const {
      isTopUtilizers,
      isDownloadingTopUtilizers,
      results,
      totalHits
    } = this.props;
    const { layout, showCountDetails } = this.state;
    const options = [
      {
        label: 'List',
        value: LAYOUTS.PERSON,
        onClick: () => this.updateLayout(LAYOUTS.PERSON)
      },
      {
        label: 'Table',
        value: LAYOUTS.TABLE,
        onClick: () => this.updateLayout(LAYOUTS.TABLE)
      }
    ];

    const num = isTopUtilizers ? results.size : totalHits;
    const numStr = num.toLocaleString();
    const plural = num === 1 ? '' : 's';

    const showToolbar = isPersonType(this.props);

    return (
      <ToolbarWrapper>
        <SubtleButtonsWrapper>
          { showToolbar ? <ButtonToolbar options={options} value={layout} noPadding /> : null }
          <NumResults withMargin={showToolbar}>
            {isTopUtilizers ? `Showing top ${numStr} utilizer${plural}` : `${numStr} result${plural}`}
          </NumResults>
        </SubtleButtonsWrapper>
        <SubtleButtonsWrapper>
          { showToolbar && isTopUtilizers && layout === LAYOUTS.PERSON ? (
            <SubtleButton onClick={() => this.setState({ showCountDetails: !showCountDetails })}>
              {`${showCountDetails ? 'Hide' : 'Show'} Score Details`}
            </SubtleButton>
          ) : null}
          {
            isTopUtilizers ? (
              <SubtleButton onClick={this.downloadTopUtilizers} disabled={isDownloadingTopUtilizers}>
                Download CSV
              </SubtleButton>
            ) : null
          }
        </SubtleButtonsWrapper>
      </ToolbarWrapper>
    );
  }

  renderTopUtilizerSearchResults = () => {
    const { layout } = this.state;

    return (isPersonType(this.props) && layout === LAYOUTS.PERSON)
      ? this.renderPersonResults()
      : this.renderTableResults();
  }

  updatePage = (start, layout) => {
    const { executeSearch, renderLayout } = this.props;

    this.setState({ start }, () => {
      executeSearch(start);
      renderLayout(layout);
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  componentDidMount() {
    const { searchStart, currLayout } = this.props;
    const { layout } = this.state;

    this.setState({
      start: searchStart || 0,
      layout: currLayout || layout
    });
  }

  render() {
    const {
      breadcrumbs,
      isTopUtilizers,
      results,
      totalHits
    } = this.props;
    const { start, layout } = this.state;
    const isExploring = !!breadcrumbs.size;

    let rankingsById = Map();
    results.forEach((utilizer, index) => {
      rankingsById = rankingsById.set(getEntityKeyId(utilizer), index + 1);
    });

    const resultContent = isExploring
      ? <EntityDetails rankingsById={rankingsById} isTopUtilizers={isTopUtilizers} />
      : this.renderTopUtilizerSearchResults();

    const numPages = Math.ceil(totalHits / MAX_RESULTS);
    const currPage = (start / MAX_RESULTS) + 1;

    return (
      <>
        {!isExploring && this.renderLayoutToolbar()}
        {resultContent}
        <Pagination
            numPages={numPages}
            activePage={currPage}
            onChangePage={(page) => this.updatePage(((page - 1) * MAX_RESULTS), layout)} />
      </>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);
  return {
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    countBreakdown: topUtilizers.get(TOP_UTILIZERS.COUNT_BREAKDOWN),
    entityTypes: state.getIn(['edm', 'entityTypes'], List()),
    entityTypesIndexMap: state.getIn(['edm', 'entityTypesIndexMap'], Map()),
    isDownloading: topUtilizers.get(TOP_UTILIZERS.IS_DOWNLOADING_TOP_UTILIZERS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    propertyTypes: state.getIn(['edm', 'propertyTypes'], List()),
    propertyTypesIndexMap: state.getIn(['edm', 'propertyTypesIndexMap'], Map()),
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchResultsContainer));
