/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ButtonToolbar from '../../components/buttons/ButtonToolbar';
import DataTable from '../../components/data/DataTable';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import NeighborTables from '../../components/data/NeighborTables';
import NeighborTimeline from '../../components/data/NeighborTimeline';
import StyledCheckbox from '../../components/controls/StyledCheckbox';
import SelectedPersonResultCard from '../../components/people/SelectedPersonResultCard';
import PersonCountsCard from '../../components/people/PersonCountsCard';
import Breadcrumbs from '../../components/nav/Breadcrumbs';
import {
  STATE,
  EDM,
  ENTITY_SETS,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { IMAGE_PROPERTY_TYPES, PERSON_ENTITY_TYPE_FQN } from '../../utils/constants/DataModelConstants';
import { FixedWidthWrapper, TableWrapper } from '../../components/layout/Layout';
import {
  getEntityKeyId,
  getFqnString,
  groupNeighbors
} from '../../utils/DataUtils';
import { getDateFilters, getPairFilters, matchesFilters } from '../../utils/EntityDateUtils';

import * as ExploreActionFactory from '../explore/ExploreActionFactory';

type Props = {
  rankingsById? :Map<string, number>,
  breadcrumbs :List<string>,
  isLoadingNeighbors :boolean,
  isTopUtilizers :boolean,
  neighborsById :Map<string, *>,
  entitiesById :Map<string, *>,
  entityTypesById :Map<string, *>,
  entitySetsById :Map<string, *>,
  entitySetPropertyMetadata :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  selectedEntitySetId :string,
  countBreakdown :Map<*, *>,
  lastQueryRun :Object,
  actions :{
    selectBreadcrumb :(index :number) => void,
    selectEntity :(entityKeyId :string) => void,
    loadEntityNeighbors :({ entityKeyId :string, entitySetId :string, selectedEntitySetId :string }) => void
  }
};

type State = {
  layout :string,
  showingAllNeighbors :boolean
}

const NeighborsWrapper = styled(FixedWidthWrapper)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
`;

const RightJustifiedRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 30px;
`;

const LAYOUTS = {
  TABLE: 'TABLE',
  TIMELINE: 'TIMELINE'
};

const HEADERS = {
  PROPERTY: 'Property',
  DATA: 'Data'
};

class EntityDetails extends React.Component<Props, State> {

  static defaultProps = {
    rankingsById: Map()
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      layout: LAYOUTS.TABLE,
      showingAllNeighbors: !props.isTopUtilizers
    };
  }

  getSelectedEntityKeyId = () => {
    const { breadcrumbs } = this.props;
    return (breadcrumbs.size) ? breadcrumbs.get(-1)[BREADCRUMB.ENTITY_KEY_ID] : null;
  }

  getSelectedEntity = () => {
    const { breadcrumbs, entitiesById } = this.props;
    if (breadcrumbs.size) {
      return entitiesById.get(this.getSelectedEntityKeyId(), Map());
    }
    return Map();
  }

  getCounts = () => {
    const { countBreakdown, entityTypesById, propertyTypesById } = this.props;

    const getEntityTypeTitle = id => entityTypesById.getIn([id, 'title'], '');

    return countBreakdown.get(this.getSelectedEntityKeyId(), Map()).entrySeq()
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

  renderCountsCard = () => {
    const entity = this.getSelectedEntity();
    const total = entity.getIn([COUNT_FQN, 0]);

    return total === undefined ? null : <PersonCountsCard total={total} counts={this.getCounts()} />;
  }

  renderEntityTable = () => {
    const { propertyTypesByFqn } = this.props;
    const entity = this.getSelectedEntity();
    const headers = List.of(fromJS({
      id: HEADERS.PROPERTY,
      value: HEADERS.PROPERTY
    }), fromJS({
      id: HEADERS.DATA,
      value: HEADERS.DATA
    }));

    let entityTable = List();
    entity.entrySeq().forEach(([fqn, values]) => {
      const ptTitle = propertyTypesByFqn.getIn([fqn, 'title']);
      if (ptTitle) {
        entityTable = entityTable.push(fromJS({
          [HEADERS.PROPERTY]: ptTitle,
          [HEADERS.DATA]: values,
          isImg: IMAGE_PROPERTY_TYPES.includes(fqn)
        }));
      }
    });

    return <TableWrapper><DataTable headers={headers} data={entityTable} /></TableWrapper>;
  }

  onSelectEntity = ({ entitySetId, entity }) => {
    const {
      actions,
      entitySetsById,
      entityTypesById,
      neighborsById,
      selectedEntitySetId,
      propertyTypesById
    } = this.props;
    const entityKeyId = getEntityKeyId(entity);
    const entityType = entityTypesById.get(entitySetsById.getIn([entitySetId, 'entityTypeId'], ''), Map());
    actions.selectEntity({
      entityKeyId,
      entitySetId,
      entityType,
      propertyTypesById
    });
    if (!neighborsById.has(entityKeyId)) {
      actions.loadEntityNeighbors({ entitySetId, entity, selectedEntitySetId });
    }
  }

  renderFilterNeighborsOption = () => {
    const { showingAllNeighbors } = this.state;

    return (
      <RightJustifiedRow>
        <StyledCheckbox
            checked={showingAllNeighbors}
            onChange={({ target }) => this.setState({ showingAllNeighbors: target.checked })}
            label="Show all neighbors" />
      </RightJustifiedRow>
    );
  }

  getCurrentNeighbors = () => {
    const {
      breadcrumbs,
      isTopUtilizers,
      propertyTypesById,
      neighborsById,
      lastQueryRun
    } = this.props;
    const { showingAllNeighbors } = this.state;


    const entity = this.getSelectedEntity();
    let neighbors = neighborsById.get(getEntityKeyId(entity), List());

    if (!showingAllNeighbors && isTopUtilizers && breadcrumbs.size === 1) {

      const pairFilters = getPairFilters(lastQueryRun);
      const dateFilters = getDateFilters(lastQueryRun, propertyTypesById);

      neighbors = neighbors.filter((neighborObj) => {
        const associationEntityTypeId = neighborObj.getIn(['associationEntitySet', 'entityTypeId']);
        const neighborEntityTypeId = neighborObj.getIn(['neighborEntitySet', 'entityTypeId']);
        const pair = List.of(associationEntityTypeId, neighborEntityTypeId);

        const associationDetails = neighborObj.get('associationDetails', Map());
        const neighborDetails = neighborObj.get('neighborDetails', Map());

        return pairFilters.has(pair) && matchesFilters(pair, dateFilters, associationDetails, neighborDetails);
      });
    }

    return neighbors;
  }

  renderNeighbors = () => {
    const {
      breadcrumbs,
      entitiesById,
      entitySetsById,
      entityTypesById,
      entitySetPropertyMetadata,
      isLoadingNeighbors,
      isTopUtilizers,
      propertyTypesById,
      propertyTypesByFqn
    } = this.props;
    const { layout } = this.state;

    const neighbors = this.getCurrentNeighbors();

    let content;

    if (isLoadingNeighbors) {
      content = <LoadingSpinner />;
    }
    else {
      content = layout === LAYOUTS.TABLE
        ? (
          <NeighborTables
              onSelectEntity={this.onSelectEntity}
              neighbors={groupNeighbors(neighbors)}
              entityTypesById={entityTypesById}
              propertyTypesById={propertyTypesById} />
        )
        : (
          <NeighborTimeline
              onSelectEntity={this.onSelectEntity}
              neighbors={neighbors}
              entitySetsById={entitySetsById}
              entityTypesById={entityTypesById}
              entitiesById={entitiesById}
              entitySetPropertyMetadata={entitySetPropertyMetadata}
              propertyTypesByFqn={propertyTypesByFqn}
              propertyTypesById={propertyTypesById} />
        );
    }

    return (
      <NeighborsWrapper>
        {breadcrumbs.size === 1 && isTopUtilizers ? this.renderFilterNeighborsOption() : null}
        {content}
      </NeighborsWrapper>
    );
  }

  updateLayout = (layout) => {
    this.setState({ layout });
  }

  renderLayoutOptions = () => {
    const { layout } = this.state;
    const options = [
      {
        label: 'Table',
        value: LAYOUTS.TABLE,
        onClick: () => this.updateLayout(LAYOUTS.TABLE)
      },
      {
        label: 'Timeline',
        value: LAYOUTS.TIMELINE,
        onClick: () => this.updateLayout(LAYOUTS.TIMELINE)
      }
    ];
    return <ButtonToolbar options={options} value={layout} />;
  }

  renderBreadcrumbs = () => {
    const { actions, breadcrumbs } = this.props;

    const crumbs = List.of({ [BREADCRUMB.TITLE]: 'Search Results' }).concat(breadcrumbs).map((crumb, index) => {
      return Object.assign({}, crumb, { [BREADCRUMB.ON_CLICK]: () => actions.selectBreadcrumb(index) });
    });
    return <Breadcrumbs breadcrumbs={crumbs} />;
  }

  isCurrentPersonType = () => {
    const { breadcrumbs, entitySetsById, entityTypesById } = this.props;
    if (!breadcrumbs.size) {
      return false;
    }

    const entitySetId = breadcrumbs.get(-1)[BREADCRUMB.ENTITY_SET_ID];
    const entityType = entityTypesById.get(entitySetsById.getIn([entitySetId, 'entityTypeId']));

    if (!entityType) {
      return false;
    }

    return getFqnString(entityType.get('type')) === PERSON_ENTITY_TYPE_FQN;
  }

  render() {
    const { rankingsById } = this.props;

    return (
      <div>
        {this.renderBreadcrumbs()}
        {this.renderLayoutOptions()}
        {this.isCurrentPersonType()
          ? (
            <SelectedPersonResultCard
                person={this.getSelectedEntity()}
                index={rankingsById.get(this.getSelectedEntityKeyId())} />
          )
          : null}
        {this.renderCountsCard()}
        {this.renderEntityTable()}
        {this.renderNeighbors()}
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const edm = state.get(STATE.EDM);
  const entitySets = state.get(STATE.ENTITY_SETS);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);

  return {
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    entityTypesById: edm.get(EDM.ENTITY_TYPES_BY_ID),
    entitySetsById: edm.get(EDM.ENTITY_SETS_BY_ID),
    entitySetPropertyMetadata: edm.get(EDM.ENTITY_SET_METADATA_BY_ID),
    propertyTypesById: edm.get(EDM.PROPERTY_TYPES_BY_ID),
    propertyTypesByFqn: edm.get(EDM.PROPERTY_TYPES_BY_FQN),
    selectedEntitySetId: entitySets.getIn([ENTITY_SETS.SELECTED_ENTITY_SET, 'id']),
    countBreakdown: topUtilizers.get(TOP_UTILIZERS.COUNT_BREAKDOWN),
    lastQueryRun: topUtilizers.get(TOP_UTILIZERS.LAST_QUERY_RUN)
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EntityDetails));
