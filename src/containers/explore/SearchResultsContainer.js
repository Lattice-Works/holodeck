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

import PersonResultCard from '../../components/people/PersonResultCard';
import ButtonToolbar from '../../components/buttons/ButtonToolbar';
import InfoButton from '../../components/buttons/InfoButton';
import DataTable from '../../components/data/DataTable';
import EntityDetails from '../data/EntityDetails';
import Pagination from '../../components/explore/Pagination';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { PERSON_ENTITY_TYPE_FQN, IMAGE_PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import {
  STATE,
  EDM,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { CenteredColumnContainer, FixedWidthWrapper, TableWrapper } from '../../components/layout/Layout';
import { getEntityKeyId, getFqnString, isPersonType } from '../../utils/DataUtils';
import * as ExploreActionFactory from './ExploreActionFactory';

type Props = {
  results :List<*>,
  filteredPropertyTypes? :Set<string>,
  isTopUtilizers :boolean,

  countBreakdown :Map<*, *>,
  selectedEntitySet :Map<*, *>,
  breadcrumbs :List<string>,
  neighborsById :Map<string, *>,
  entityTypesById :Map<string, *>,
  entitySetsById :Map<string, *>,
  propertyTypesById :Map<string, *>,
  totalHits :number,
  actions :{
    selectEntity :(entityKeyId :string) => void,
    loadEntityNeighbors :({ entitySetId :string, entity :Map<*, *> }) => void
  }
}

type State = {
  layout :string,
  showCountDetails :boolean,
  start :number
}


const ToolbarWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SmallInfoButton = styled(InfoButton)`
  font-size: 12px;
`;

const LAYOUTS = {
  PERSON: 'PERSON',
  TABLE: 'TABLE'
};

const MAX_RESULTS = 20;

class SearchResultsContainer extends React.Component<Props, State> {

  static defaultProps = {
    filteredPropertyTypes: Set()
  };

  constructor(props :Props) {
    super(props);
    this.state = {
      layout: isPersonType(props) ? LAYOUTS.PERSON : LAYOUTS.TABLE,
      showCountDetails: false,
      start: 0
    };
  }

  updateLayout = layout => this.setState({ layout });

  onSelect = (index, entity) => {
    const {
      actions,
      entityTypesById,
      neighborsById,
      selectedEntitySet
    } = this.props;

    const entityKeyId = getEntityKeyId(entity);
    const entitySetId = selectedEntitySet.get('id');
    const selectedEntitySetId = entitySetId;
    const entityType = entityTypesById.get(selectedEntitySet.get('entityTypeId'), Map());
    actions.selectEntity({ entityKeyId, entitySetId, entityType });
    if (!neighborsById.has(entityKeyId)) {
      actions.loadEntityNeighbors({ entitySetId, entity, selectedEntitySetId });
    }
  };

  getCountsForUtilizer = (entityKeyId) => {
    const { countBreakdown, entityTypesById, propertyTypesById } = this.props;

    const getEntityTypeTitle = id => entityTypesById.getIn([id, 'title'], '');

    return countBreakdown.get(entityKeyId, Map()).entrySeq()
      .filter(([pair]) => pair !== 'score')
      .flatMap(([pair, pairMap]) => {
        const pairTitle = `${getEntityTypeTitle(pair.get(0))} ${getEntityTypeTitle(pair.get(1))}`;
        return pairMap.entrySeq().map(([key, count]) => {
          const title = key === COUNT_FQN
            ? pairTitle
            : `${pairTitle} -- ${propertyTypesById.getIn([key, 'title'], '')}`;
          return Map().set(TOP_UTILIZERS_FILTER.LABEL, title).set(COUNT_FQN, count);
        });
      });
  }

  renderPersonResults = () => {
    const { isTopUtilizers, results } = this.props;
    const { showCountDetails, start } = this.state;

    return results.map((person, index) => (
      <PersonResultCard
          key={getEntityKeyId(person)}
          counts={isTopUtilizers && showCountDetails ? this.getCountsForUtilizer(getEntityKeyId(person)) : null}
          index={index + 1 + start}
          person={person}
          onClick={() => this.onSelect(index, person)} />
    ));
  }

  renderTableResults = () => {
    const {
      entityTypesById,
      filteredPropertyTypes,
      isTopUtilizers,
      propertyTypesById,
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

    const propertyTypes = entityTypesById
      .getIn([selectedEntitySet.get('entityTypeId'), 'properties'], List())
      .map(id => propertyTypesById.get(id));

    propertyTypes.forEach((propertyType) => {
      const id = getFqnString(propertyType.get('type'));
      const value = propertyType.get('title');
      if (!filteredPropertyTypes.has(id)) {
        const isImg = IMAGE_PROPERTY_TYPES.includes(id);
        propertyTypeHeaders = propertyTypeHeaders.push(fromJS({ id, value, isImg }));
      }
    });

    return (
      <TableWrapper>
        <DataTable headers={propertyTypeHeaders} data={results} onRowClick={this.onSelect} />
      </TableWrapper>
    );
  };

  renderLayoutToolbar = () => {
    const { isTopUtilizers } = this.props;
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
    return (
      <ToolbarWrapper>
        <ButtonToolbar options={options} value={layout} noPadding />
        { isTopUtilizers && layout === LAYOUTS.PERSON ? (
          <SmallInfoButton onClick={() => this.setState({ showCountDetails: !showCountDetails })}>
            {`${showCountDetails ? 'Hide' : 'Show'} Score Details`}
          </SmallInfoButton>
        ) : null}
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
      start: searchStart,
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
      <CenteredColumnContainer>
        <FixedWidthWrapper>
          {(isPersonType(this.props) && !isExploring) ? this.renderLayoutToolbar() : null}
          {resultContent}
          <Pagination
              numPages={numPages}
              activePage={currPage}
              onChangePage={page => this.updatePage(((page - 1) * MAX_RESULTS), layout)} />
        </FixedWidthWrapper>
      </CenteredColumnContainer>
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
    propertyTypesById: edm.get(EDM.PROPERTY_TYPES_BY_ID),
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET),
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    countBreakdown: topUtilizers.get(TOP_UTILIZERS.COUNT_BREAKDOWN)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(ExploreActionFactory).forEach((action :string) => {
    actions[action] = ExploreActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SearchResultsContainer));
