import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/pro-regular-svg-icons';

import NavButton from './NavButton';

const BackNavButton = ({ children, onClick }) => (
  <NavButton onClick={onClick}>
    <FontAwesomeIcon icon={faChevronLeft} />
    <span>{children}</span>
  </NavButton>
);

export default BackNavButton;
