/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'lattice-ui-kit';

const ButtonWrapper = styled.div`
  > button {
    background-color: white;
    border: none;
    padding: 8px 12px;
    transform: ${(props) => (props.isPointingUp ? 'rotate(180deg)' : 'rotate(0deg)')};
    transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

type Props = {
  isPointingUp ?:boolean;
  onClick :() => void;
};

const ChevronButton = ({ isPointingUp, onClick } :Props) => (
  <ButtonWrapper isPointingUp={isPointingUp}>
    <Button onClick={onClick} size="small">
      <FontAwesomeIcon fixedWidth icon={faChevronDown} />
    </Button>
  </ButtonWrapper>
);

ChevronButton.defaultProps = {
  isPointingUp: false,
};

export default ChevronButton;
