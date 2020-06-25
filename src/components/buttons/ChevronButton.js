/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faChevronDown } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconButton } from 'lattice-ui-kit';

const ChevronIcon = (
  <FontAwesomeIcon fixedWidth icon={faChevronDown} size="lg" />
);

const ChevronButton = styled(IconButton).attrs({
  icon: ChevronIcon,
})`
  background-color: white;
  border: none;
  padding: 8px 12px;
  transform: ${(props) => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
`;

export default ChevronButton;
