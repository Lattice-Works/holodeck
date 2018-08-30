import React from 'react';

import EntitySetSearch from '../entitysets/EntitySetSearch';
import { ComponentWrapper } from '../../components/layout/Layout';

export default class TopUtilizersContainer extends React.Component {

  render() {
    return (
      <ComponentWrapper>
        <EntitySetSearch />
      </ComponentWrapper>
    );
  }
}
