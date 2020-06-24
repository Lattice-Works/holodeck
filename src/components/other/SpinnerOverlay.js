/*
 * @flow
 */

import styled from 'styled-components';
import { rgba } from 'polished';

const SpinnerOverlay = styled.div`
  background-color: ${rgba('white', 0.8)};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  opacity: 0.9;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 1000;
`;

export default SpinnerOverlay;
