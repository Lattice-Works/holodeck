/*
 * @flow
 */

import styled, { css } from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const FONT_SIZE = {
  h1: '36px',
  h2: '28px',
  h3: '24px',
  h4: '20px',
  h5: '16px',
};

const MARGIN_BOTTOM = {
  h1: '24px',
  h2: '16px',
  h3: '12px',
  h4: '8px',
  h5: '8px',
};

type ALIGN =
  | 'start'
  | 'center'
  | 'end';

type AS =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5';

type Props = {
  align ?:ALIGN;
  as ?:AS;
};

const getComputedStyles = ({ align = 'center', as = 'h1' } :Props) => (
  css`
    font-size: ${FONT_SIZE[as]};
    font-weight: ${(as === 'h1' ? 'bold' : 500)};
    line-height: ${(as === 'h1' ? 1.15 : 1.5)};
    margin-bottom: ${MARGIN_BOTTOM[as]};
    text-align: ${align};
  `
);

const Header = styled.h1`
  align-items: center;
  color: ${NEUTRAL.N700};
  display: flex;
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-word;
  ${getComputedStyles}
`;

export default Header;
