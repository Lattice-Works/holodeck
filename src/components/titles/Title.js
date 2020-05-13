/*
 * @flow
 */

import styled from 'styled-components';

import { Colors } from 'lattice-ui-kit';

const { NEUTRALS } = Colors;

const Title = styled.h1`
  color: ${NEUTRALS[0]};
  font-size: 28px;
  font-weight: normal;
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

export default Title;
