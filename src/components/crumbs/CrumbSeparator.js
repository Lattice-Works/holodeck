/*
 * @flow
 */

import React from 'react';

import { faChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type Props = {
  icon ?:any;
  size ?:string;
};

const CrumbSeparator = ({ icon, size } :Props) => (
  <FontAwesomeIcon icon={icon} fixedWidth size={size} />
);

CrumbSeparator.defaultProps = {
  icon: faChevronRight,
  size: 'sm',
};

export default CrumbSeparator;
