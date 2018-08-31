import React from 'react';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import EntitySetSearch from '../entitysets/EntitySetSearch';
import TopUtilizerParameterSelection from '../../components/toputilizers/TopUtilizerParameterSelection';
import { STATE, ENTITY_SETS, TOP_UTILIZERS } from '../../utils/constants/StateConstants';
import { ComponentWrapper, HeaderComponentWrapper } from '../../components/layout/Layout';
import * as EntitySetActionFactory from '../entitysets/EntitySetActionFactory';

type Props = {
  selectedEntitySet :Immutable.Map<*, *>,
  actions :{
    selectEntitySet :(entitySet? :Immutable.Map<*, *>) => void
  }
};

class TopUtilizersContainer extends React.Component<Props> {

  render() {
    const { actions, entitySetSearchResults, selectedEntitySet } = this.props;

    return (
      <div>
        {
          selectedEntitySet
            ? (
              <TopUtilizerParameterSelection
                  selectedEntitySet={selectedEntitySet}
                  deselectEntitySet={() => actions.selectEntitySet()} />
            ) : <EntitySetSearch />
        }
      </div>
    );
  }
}

function mapStateToProps(state :Immutable.Map<*, *>) :Object {
  const entitySets = state.get(STATE.ENTITY_SETS);
  return {
    selectedEntitySet: entitySets.get(ENTITY_SETS.SELECTED_ENTITY_SET)
  };
}

function mapDispatchToProps(dispatch :Function) :Object {
  const actions :{ [string] :Function } = {};

  Object.keys(EntitySetActionFactory).forEach((action :string) => {
    actions[action] = EntitySetActionFactory[action];
  });

  return {
    actions: {
      ...bindActionCreators(actions, dispatch)
    }
  };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TopUtilizersContainer));
