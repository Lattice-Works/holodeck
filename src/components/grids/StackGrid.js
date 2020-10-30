/*
 * @flow
 */

import styled from 'styled-components';

const StackGrid = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: 16px;
  grid-template-columns: 1fr;
  position: relative;
`;

export default StackGrid;
