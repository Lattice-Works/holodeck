/*
 * @flow
 */

import React from 'react';
import type { Node } from 'react';

import { faChevronLeft } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import NavButton from './NavButton';

type Props = {
  children :Node;
  onClick :() => void;
};

const BackNavButton = ({ children, onClick } :Props) => (
  <NavButton onClick={onClick}>
    <FontAwesomeIcon icon={faChevronLeft} />
    <span>{children}</span>
  </NavButton>
);

export default BackNavButton;
