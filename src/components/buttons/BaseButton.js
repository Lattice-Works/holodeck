/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Spinner } from 'lattice-ui-kit';

// TODO: import type { ButtonColor, ButtonVariant } from 'lattice-ui-kit';

type ButtonColor =
  | 'default'
  | 'error'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning';

type ButtonVariant =
  | 'contained'
  | 'outlined'
  | 'text';

const IconWrapper = styled.span`
  margin-right: 2px;
`;

type ButtonProps = {|
  'aria-label' ?:string;
  children ?:any;
  color ?:ButtonColor;
  icon ?:any;
  isDisabled ?:boolean;
  isPending ?:boolean;
  onClick ?:() => void;
  type ?:string;
  variant ?:ButtonVariant;
|};

// 2020-07-17 NOTE: using "disabled" prop instead of "isLoading" because of a margin bug in LUK
const BaseButton = ({
  children,
  icon,
  isDisabled,
  isPending,
  ...rest
} :ButtonProps) => (
  /* eslint-disable react/jsx-props-no-spreading */
  <Button {...rest} disabled={isDisabled || isPending}>
    {
      isPending && (
        children
          ? (
            <IconWrapper>
              <Spinner />
            </IconWrapper>
          )
          : <Spinner />
      )
    }
    {
      !isPending && (
        children
          ? (
            <IconWrapper>
              <FontAwesomeIcon fixedWidth icon={icon} />
            </IconWrapper>
          )
          : <FontAwesomeIcon fixedWidth icon={icon} />
      )
    }
    {children}
  </Button>
  /* eslint-enable */
);

BaseButton.defaultProps = {
  'aria-label': undefined,
  children: null,
  color: 'primary',
  icon: null,
  isDisabled: false,
  isPending: false,
  onClick: () => {},
  type: 'button',
  variant: 'contained',
};

export default BaseButton;
export type { ButtonProps };
