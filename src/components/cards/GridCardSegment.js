/*
 * @flow
 */

import type { ComponentType } from 'react';

import styled from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';

const GridCardSegment :ComponentType<{|
  children ?:any;
  gap ?:number;
  padding ?:string;
|}> = styled(CardSegment)`
  align-items: center;
  display: grid;
  grid-gap: ${({ gap }) => (gap ? `${gap}px` : '24px')};
  grid-template-columns: 1fr auto;
`;

export default GridCardSegment;
