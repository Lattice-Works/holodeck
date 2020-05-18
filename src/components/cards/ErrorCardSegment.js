import styled, { css } from 'styled-components';
import { CardSegment } from 'lattice-ui-kit';

const getComputedStyles = ({ borderless }) => {

  if (borderless) {
    return css`
      border: none !important;
    `;
  }

  return css``;
};

const ErrorCardSegment = styled(CardSegment)`
  align-items: center;
  flex: 0;
  justify-content: center;
  ${getComputedStyles}

  > span {
    margin: 10px 0;
  }

  > span:last-of-type {
    margin: 0;
  }
`;

export default ErrorCardSegment;
