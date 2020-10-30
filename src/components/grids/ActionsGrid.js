/*
 * @flow
 */

import { Children } from 'react';

import styled from 'styled-components';

const ActionsGrid = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  grid-gap: 8px;
  grid-template-columns: 1fr repeat(${({ children }) => Children.count(children) - 1}, auto);

  button {
    line-height: 1.5;
  }
`;

export default ActionsGrid;
