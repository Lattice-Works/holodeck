/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map, fromJS } from 'immutable';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LoadingSpinner from '../../components/LoadingSpinner';
import DataTable from '../../components/data/DataTable';
import NeighborTables from '../../components/data/NeighborTables';
import PersonResultCard from '../../components/people/PersonResultCard';
import {
  STATE,
  EDM,
  EXPLORE,
  TOP_UTILIZERS
} from '../../utils/constants/StateConstants';
import { TableWrapper } from '../../components/layout/Layout';
import { getEntityKeyId, getNeighborCountsForFilters } from '../../utils/DataUtils';
import * as ExploreActionFactory from '../explore/ExploreActionFactory';

type Props = {
  withCounts? :boolean,
  isPersonType :boolean,
  entity :Map<*, *>,
  isLoadingNeighbors :boolean,
  neighborsById :Map<string, *>,
  propertyTypesByFqn :Map<string, *>,
  propertyTypesById :Map<string, *>,
  topUtilizerFilters :List<*>
};

type State = {
  layout :string
}

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
    withCounts: false
  }

  constructor(props :Props) {
    super(props);
    this.state = {
      layout: LAYOUTS.TABLE
    };
  }

  renderPersonCard = () => {
    const {
      entity,
      neighborsById,
      topUtilizerFilters,
      withCounts
    } = this.props;
    let counts;
    if (withCounts) {
      const neighbors = neighborsById.get(getEntityKeyId(entity), List());
      counts = getNeighborCountsForFilters(topUtilizerFilters, neighbors);
    }
    return <PersonResultCard person={entity} counts={counts} />;
  }

  renderEntityTable = () => {
    const { entity, propertyTypesByFqn } = this.props;
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

  render() {
    const { isPersonType } = this.props;
    return (
      <div>
        {isPersonType ? this.renderPersonCard() : null}
        {this.renderEntityTable()}
      </div>
    );
  }
}

function mapStateToProps(state :Map<*, *>) :Object {
  const explore = state.get(STATE.EXPLORE);
  const edm = state.get(STATE.EDM);
  const topUtilizers = state.get(STATE.TOP_UTILIZERS);

  return {
    entity: explore.get(EXPLORE.SELECTED_ENTITY),
    isLoadingNeighbors: explore.get(EXPLORE.IS_LOADING_ENTITY_NEIGHBORS),
    neighborsById: explore.get(EXPLORE.ENTITY_NEIGHBORS_BY_ID),
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
