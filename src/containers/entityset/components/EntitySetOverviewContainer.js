/*
 * @flow
 */

import React from 'react';

import { Models } from 'lattice';
import {
  AppContentWrapper,
  Colors,
} from 'lattice-ui-kit';

import { Title } from '../../../components';

const { WHITE } = Colors;
const { EntitySet } = Models;

type Props = {
  entitySet :EntitySet;
};

const EntitySetOverviewContainer = ({ entitySet } :Props) => {

  return (
    <AppContentWrapper bgColor={WHITE} borderless>
      <Title>{entitySet.title}</Title>
      <span>{entitySet.description}</span>
    </AppContentWrapper>
  );
};

export default EntitySetOverviewContainer;
