/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { Breadcrumbs } from 'lattice-ui-kit';

import CrumbSeparator from './CrumbSeparator';

const Separator = (
  <CrumbSeparator size="xs" />
);

const CrumbsWrapper = styled(Breadcrumbs).attrs({ separator: Separator })`
  margin-bottom: 24px;
`;

type Props = {
  children :Node;
};

const Crumbs = ({ children } :Props) => (
  <CrumbsWrapper>
    {children}
  </CrumbsWrapper>
);

export default Crumbs;
