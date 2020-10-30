/*
 * @flow
 */

import React from 'react';

import { faSearch } from '@fortawesome/pro-regular-svg-icons';

import BaseButton from './BaseButton';
import type { ButtonProps } from './BaseButton';

const SearchButton = ({ children, ...props } :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <BaseButton {...props} icon={faSearch}>
    {children}
  </BaseButton>
  /* eslint-enable */
);

export default SearchButton;
