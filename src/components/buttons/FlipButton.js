/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import styled from 'styled-components';
import { Button } from 'lattice-ui-kit';

const RotationWrapper = styled.div`
  > button {
    background-color: white;
    border: none;
    padding: 8px 12px;
    transform: ${(props) => (props.flip ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

type Props = {
  children :Node;
  className :string;
  flip :boolean;
  onClick ?:() => void;
  size ?:string;
};

const FlipButton = (props :Props) => {

  const {
    children,
    className,
    flip,
    onClick,
    size,
    ...rest
  } = props;

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <RotationWrapper className={className} flip={flip}>
      <Button {...rest} onClick={onClick} size={size}>
        {children}
      </Button>
    </RotationWrapper>
  );
  /* eslint-enable */
};

FlipButton.defaultProps = {
  className: '',
  flip: false,
  onClick: () => {},
  size: 'small',
};

export default FlipButton;
