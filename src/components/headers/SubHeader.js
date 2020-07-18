/*
 * @flow
 */

import styled, { css } from 'styled-components';
import { Colors } from 'lattice-ui-kit';

const { NEUTRAL } = Colors;

const FONT_SIZE = {
  h4: '18px',
  h5: '14px',
  h6: '12px',
};

const MARGIN_BOTTOM = {
  h4: '12px',
  h5: '8px',
  h6: '8px',
};

type ALIGN =
  | 'start'
  | 'center'
  | 'end';

type AS =
  | 'h4'
  | 'h5'
  | 'h6';

type Props = {
  align ?:ALIGN;
  as ?:AS;
};

const getComputedStyles = ({ align = 'center', as = 'h4' } :Props) => (
  css`
    font-size: ${FONT_SIZE[as]};
    margin-bottom: ${MARGIN_BOTTOM[as]};
    text-align: ${align};
  `
);

const SubHeader = styled.h4`
  align-items: center;
  color: ${NEUTRAL.N500};
  display: flex;
  font-weight: normal;
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-break: break-word;
  ${getComputedStyles}
`;

export default SubHeader;
