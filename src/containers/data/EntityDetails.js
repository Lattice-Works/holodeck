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
import LoadingSpinner from '../../components/LoadingSpinner';
import NeighborTables from '../../components/data/NeighborTables';
import NeighborTimeline from '../../components/data/NeighborTimeline';
import SelectedPersonResultCard from '../../components/people/SelectedPersonResultCard';
import PersonCountsCard from '../../components/people/PersonCountsCard';
import Breadcrumbs from '../../components/nav/Breadcrumbs';
import {
  STATE,
  EDM,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';
import { PERSON_ENTITY_TYPE_FQN } from '../../utils/constants/DataModelConstants';
import { FixedWidthWrapper, TableWrapper } from '../../components/layout/Layout';
import {
  getEntityKeyId,
  getFqnString,
  getNeighborCountsForFilters,
  groupNeighbors
} from '../../utils/DataUtils';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';

type Props = {
  rankingsById? :Map<string, number>,
  breadcrumbs :List<string>,
  isLoadingNeighbors :boolean,
  neighborsById :Map<string, *>,
  entitiesById :Map<string, *>,
  entityTypesById :Map<string, *>,
  entitySetsById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  topUtilizerFilters :List<*>,
  actions :{
    selectBreadcrumb :(index :number) => void,
    selectEntity :(entityKeyId :string) => void,
    loadEntityNeighbors :({ entityKeyId :string, entitySetId :string }) => void
  }
};

type State = {
  layout :string
}

const NeighborsWrapper = styled(FixedWidthWrapper)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
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
      layout: LAYOUTS.TABLE
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

  renderCountsCard = () => {
    const {
      neighborsById,
      topUtilizerFilters
    } = this.props;
    const entity = this.getSelectedEntity();
    const total = entity.getIn([COUNT_FQN, 0]);
    if (total === undefined) return null;

    const neighbors = neighborsById.get(getEntityKeyId(entity), List());
    const counts = getNeighborCountsForFilters(topUtilizerFilters, neighbors);

    return <PersonCountsCard total={total} counts={counts} />;
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
          [HEADERS.DATA]: values
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
      neighborsById
    } = this.props;
    const entityKeyId = getEntityKeyId(entity);
    const entityType = entityTypesById.get(entitySetsById.getIn([entitySetId, 'entityTypeId'], ''), Map());
    actions.selectEntity({ entityKeyId, entitySetId, entityType });
    if (!neighborsById.has(entityKeyId)) {
      actions.loadEntityNeighbors({ entitySetId, entity });
    }
  }

  renderNeighbors = () => {
    const {
      entitiesById,
      entitySetsById,
      entityTypesById,
      isLoadingNeighbors,
      neighborsById,
      propertyTypesById,
      propertyTypesByFqn
    } = this.props;
    const { layout } = this.state;

    const entity = this.getSelectedEntity();
    const neighbors = neighborsById.get(getEntityKeyId(entity), List());

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
              propertyTypesByFqn={propertyTypesByFqn}
              propertyTypesById={propertyTypesById} />
        );
    }

    return <NeighborsWrapper>{content}</NeighborsWrapper>;
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
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);

  return {
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    entityTypesById: edm.get(EDM.ENTITY_TYPES_BY_ID),
    entitySetsById: edm.get(EDM.ENTITY_SETS_BY_ID),
    propertyTypesById: edm.get(EDM.PROPERTY_TYPES_BY_ID),
    propertyTypesByFqn: edm.get(EDM.PROPERTY_TYPES_BY_FQN),
    topUtilizerFilters: topUtilizers.get(TOP_UTILIZERS.TOP_UTILIZER_FILTERS)
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
