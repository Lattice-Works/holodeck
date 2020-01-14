/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { Models } from 'lattice';
import { CardStack } from 'lattice-ui-kit';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import type { Location } from 'react-router';
import type { RequestSequence } from 'redux-reqseq';

import Breadcrumbs from '../../components/nav/Breadcrumbs';
import ButtonToolbar from '../../components/buttons/ButtonToolbar';
import DataTable from '../../components/data/DataTable';
import LoadingSpinner from '../../components/loading/LoadingSpinner';
import NeighborTables from '../../components/data/NeighborTables';
import NeighborTimeline from '../../components/data/NeighborTimeline';
import PersonScoreCard from '../../components/people/PersonScoreCard';
import SelectedPersonResultCard from '../../components/people/SelectedPersonResultCard';
import StyledCheckbox from '../../components/controls/StyledCheckbox';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';
import * as LinkingActions from '../linking/LinkingActions';
import * as RoutingActions from '../../core/router/RoutingActions';
import { FixedWidthWrapper, TableWrapper } from '../../components/layout/Layout';
import { getEntityKeyId, groupNeighbors } from '../../utils/DataUtils';
import { getDateFilters, getPairFilters, matchesFilters } from '../../utils/EntityDateUtils';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { IMAGE_PROPERTY_TYPES, PERSON_ENTITY_TYPE_FQN } from '../../utils/constants/DataModelConstants';
import { BREADCRUMB } from '../../utils/constants/ExploreConstants';
import { EXPLORE, STATE, TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { EntityLinksContainer } from '../linking';
import type { GoToRoute } from '../../core/router/RoutingActions';

const { FullyQualifiedName } = Models;

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
  LINKING: 'LINKING',
  TABLE: 'TABLE',
  TIMELINE: 'TIMELINE'
};

const HEADERS = {
  PROPERTY: 'Property',
  DATA: 'Data'
};

type Props = {
  actions :{
    goToRoute :GoToRoute;
    loadEntityNeighbors :RequestSequence;
    searchLinkedEntitySets :RequestSequence;
    selectBreadcrumb :RequestSequence;
    selectEntity :RequestSequence;
  };
  breadcrumbs :List<string>;
  countBreakdown :Map<*, *>;
  entitiesById :Map<string, *>;
  entitySets :List;
  entitySetsIndexMap :Map;
  entitySetsMetaData :Map;
  entityTypes :List;
  entityTypesIndexMap :Map;
  isLoadingNeighbors :boolean;
  isTopUtilizers :boolean;
  lastQueryRun :Object;
  location :Location;
  neighborsById :Map<string, *>;
  propertyTypes :List;
  propertyTypesIndexMap :Map;
  rankingsById :Map<string, number>;
  selectedEntitySetId :string;
};

type State = {
  layout :string;
  showingAllNeighbors :boolean;
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

    return countBreakdown.get(this.getSelectedEntityKeyId(), Map()).entrySeq()
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

  renderCountsCard = () => {
    const entity = this.getSelectedEntity();
    const total = entity.getIn([COUNT_FQN, 0]);

    if (typeof total !== 'number') {
      return null;
    }

    return (
      <PersonScoreCard total={total} counts={this.getCounts()} />
    );
  }

  renderEntityTable = () => {
    const { propertyTypes, propertyTypesIndexMap } = this.props;
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
      const propertyTypeIndex = propertyTypesIndexMap.get(fqn);
      const propertyType = propertyTypes.get(propertyTypeIndex, Map());
      const propertyTypeTitle = propertyType.get('title', '');
      if (propertyTypeTitle) {
        entityTable = entityTable.push(fromJS({
          [HEADERS.PROPERTY]: propertyTypeTitle,
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
      entitySets,
      entitySetsIndexMap,
      entityTypes,
      entityTypesIndexMap,
      neighborsById,
      propertyTypes,
      propertyTypesIndexMap,
      selectedEntitySetId,
    } = this.props;
    const entityKeyId = getEntityKeyId(entity);
    const entitySetIndex :number = entitySetsIndexMap.get(entitySetId);
    const entitySet :Map = entitySets.get(entitySetIndex, Map());
    const entityTypeId :UUID = entitySet.get('entityTypeId', '');
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
      propertyTypes,
      propertyTypesIndexMap,
      neighborsById,
      lastQueryRun
    } = this.props;
    const { showingAllNeighbors } = this.state;


    const entity = this.getSelectedEntity();
    let neighbors = neighborsById.get(getEntityKeyId(entity), List());

    if (!showingAllNeighbors && isTopUtilizers && breadcrumbs.size === 1) {

      const pairFilters = getPairFilters(lastQueryRun);
      const dateFilters = getDateFilters(lastQueryRun, propertyTypes, propertyTypesIndexMap);

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
      entitySets,
      entitySetsIndexMap,
      entitySetsMetaData,
      entityTypes,
      entityTypesIndexMap,
      isLoadingNeighbors,
      isTopUtilizers,
      propertyTypes,
      propertyTypesIndexMap,
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
              entityTypes={entityTypes}
              entityTypesIndexMap={entityTypesIndexMap}
              propertyTypes={propertyTypes}
              propertyTypesIndexMap={propertyTypesIndexMap} />
        )
        : (
          <NeighborTimeline
              entitiesById={entitiesById}
              entitySets={entitySets}
              entitySetsIndexMap={entitySetsIndexMap}
              entitySetsMetaData={entitySetsMetaData}
              entityTypes={entityTypes}
              entityTypesIndexMap={entityTypesIndexMap}
              neighbors={neighbors}
              onSelectEntity={this.onSelectEntity}
              propertyTypes={propertyTypes}
              propertyTypesIndexMap={propertyTypesIndexMap} />
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

    const { entitySets, entitySetsIndexMap, selectedEntitySetId } = this.props;
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
      },
    ];

    const entitySetIndex :number = entitySetsIndexMap.get(selectedEntitySetId);
    const entitySet :Map = entitySets.get(entitySetIndex, Map());
    const isLinkedEntitySet :boolean = entitySet.get('flags', List()).includes('LINKING');
    if (isLinkedEntitySet) {
      options.push({
        label: 'Linking',
        value: LAYOUTS.LINKING,
        onClick: () => this.updateLayout(LAYOUTS.LINKING)
      });
    }

    return <ButtonToolbar options={options} value={layout} />;
  }

  renderBreadcrumbs = () => {
    const { actions, breadcrumbs } = this.props;

    const crumbs = List.of({ [BREADCRUMB.TITLE]: 'Search Results' })
      .concat(breadcrumbs)
      .map((crumb, index) => ({ ...crumb, [BREADCRUMB.ON_CLICK]: () => actions.selectBreadcrumb(index) }));
    return <Breadcrumbs breadcrumbs={crumbs} />;
  }

  isCurrentPersonType = () => {

    const {
      breadcrumbs,
      entitySets,
      entitySetsIndexMap,
      entityTypes,
      entityTypesIndexMap,
    } = this.props;

    if (!breadcrumbs.size) {
      return false;
    }

    const entitySetId :UUID = breadcrumbs.get(-1)[BREADCRUMB.ENTITY_SET_ID];
    const entitySetIndex :number = entitySetsIndexMap.get(entitySetId);
    const entitySet :Map = entitySets.get(entitySetIndex, Map());
    const entityTypeId :UUID = entitySet.get('entityTypeId', '');
    const entityTypeIndex :number = entityTypesIndexMap.get(entityTypeId);
    const entityType :Map = entityTypes.get(entityTypeIndex, Map());

    if (!entityType) {
      return false;
    }

    return FullyQualifiedName.toString(entityType.get('type')) === PERSON_ENTITY_TYPE_FQN;
  }

  render() {

    const { rankingsById, selectedEntitySetId } = this.props;
    const { layout } = this.state;

    const selectedEntityKeyId :UUID = this.getSelectedEntityKeyId();

    return (
      <div>
        {this.renderBreadcrumbs()}
        {this.renderLayoutOptions()}
        <CardStack>
          {
            this.isCurrentPersonType() && (
              <SelectedPersonResultCard
                  person={this.getSelectedEntity()}
                  index={rankingsById.get(selectedEntityKeyId)} />
            )
          }
          {
            layout === LAYOUTS.LINKING && (
              <EntityLinksContainer entitySetId={selectedEntitySetId} entityKeyId={selectedEntityKeyId} />
            )
          }
          {layout !== LAYOUTS.LINKING && this.renderCountsCard()}
          {layout !== LAYOUTS.LINKING && this.renderEntityTable()}
        </CardStack>
        {layout !== LAYOUTS.LINKING && this.renderNeighbors()}
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>, props) :Object {

  const {
    params: {
      id: selectedEntitySetId = null,
    } = {},
  } = props.match;

  const explore = state.get(STATE.EXPLORE);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);

  return {
    selectedEntitySetId,
    breadcrumbs: explore.get(EXPLORE.BREADCRUMBS),
    countBreakdown: topUtilizers.get(TOP_UTILIZERS.COUNT_BREAKDOWN),
    entitiesById: explore.get(EXPLORE.ENTITIES_BY_ID),
    entitySets: state.getIn(['edm', 'entitySets'], List()),
    entitySetsIndexMap: state.getIn(['edm', 'entitySetsIndexMap'], Map()),
    entitySetsMetaData: state.getIn(['edm', 'entitySetsMetaData'], Map()),
    entityTypes: state.getIn(['edm', 'entityTypes'], List()),
    entityTypesIndexMap: state.getIn(['edm', 'entityTypesIndexMap'], Map()),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    lastQueryRun: topUtilizers.get(TOP_UTILIZERS.LAST_QUERY_RUN),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
    propertyTypes: state.getIn(['edm', 'propertyTypes'], List()),
    propertyTypesIndexMap: state.getIn(['edm', 'propertyTypesIndexMap'], Map()),
  };
}

const mapActionsToProps = (dispatch :Function) => ({
  actions: bindActionCreators({
    goToRoute: RoutingActions.goToRoute,
    loadEntityNeighbors: ExploreActionFactory.loadEntityNeighbors,
    searchLinkedEntitySets: LinkingActions.searchLinkedEntitySets,
    selectBreadcrumb: ExploreActionFactory.selectBreadcrumb,
    selectEntity: ExploreActionFactory.selectEntity,
  }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapActionsToProps)(EntityDetails));
