/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';

const StackGrid :ComponentType<{|
  children ?:any;
  gap ?:number;
|}> = styled.div`
  display: grid;
  grid-auto-rows: min-content;
  grid-gap: ${({ gap }) => (gap ? `${gap}px` : '24px')};
  grid-template-columns: 1fr;
  position: relative;
`;

export default StackGrid;
