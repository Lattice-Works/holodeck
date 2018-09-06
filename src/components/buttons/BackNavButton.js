import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-regular-svg-icons';

const Button = styled.button`
  border: none;
  font-family: 'Open Sans', sans-serif;
  color: #6124e2;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  background: transparent;

  span {
    margin-left: 7px;
  }

  &:focus {
    outline: none;
  }

  &:hover {
    cursor: pointer;
    color: #361876;
  }
`;

const BackNavButton = ({ children, onClick }) => (
  <Button onClick={onClick}>
    <FontAwesomeIcon icon={faChevronLeft} />
    <span>{children}</span>
  </Button>
);

export default BackNavButton;
