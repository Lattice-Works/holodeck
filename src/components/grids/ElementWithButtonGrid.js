/*
 * @flow
 */

import styled, { css } from 'styled-components';

type Props = {
  fitContent :boolean;
};

const getComputedStyles = ({ fitContent } :Props) => {

  let gtc = '1fr auto';
  if (fitContent) {
    gtc = 'fit-content(100%) min-content';
  }

  return css`
    grid-template-columns: ${gtc};
  `;
};

const ElementWithButtonGrid = styled.div`
  align-items: center;
  display: grid;
  grid-gap: 16px;
  ${getComputedStyles}
`;

export default ElementWithButtonGrid;
