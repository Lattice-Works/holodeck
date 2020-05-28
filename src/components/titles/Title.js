/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRALS } = Colors;

const FONT_SIZES = {
  h1: '28px',
  h2: '24px',
  h3: '18px',
};

const Header = styled.h1`
  color: ${NEUTRALS[0]};
  font-size: ${({ as }) => FONT_SIZES[as]};
  font-weight: normal;
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

type AS =
  | 'h1'
  | 'h2'
  | 'h3';

type Props = {
  as ?:AS;
  children :Node;
  className ?:string;
};

const Title = ({
  as,
  children,
  className,
} :Props) => (
  <Header as={as} className={className}>{children}</Header>
);

Title.defaultProps = {
  as: 'h1',
  className: undefined,
};

export default Title;
