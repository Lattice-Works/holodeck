/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faEmptySet } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors } from 'lattice-ui-kit';

import { BasicErrorComponent } from '../errors';

const { NEUTRAL } = Colors;

const DEFAULT_MESSAGE = 'Make sure you are a member of an organization and have permissions.';

const NoSearchResults = styled.span`
  color: ${NEUTRAL.N500};
`;

type Props = {
  message ?:string;
};

const NoSearchResultsCardSegment = ({ message } :Props) => (
  <BasicErrorComponent>
    <FontAwesomeIcon icon={faEmptySet} size="3x" />
    <NoSearchResults>No search results.</NoSearchResults>
    <span>{message}</span>
  </BasicErrorComponent>
);

NoSearchResultsCardSegment.defaultProps = {
  message: DEFAULT_MESSAGE,
};

export default NoSearchResultsCardSegment;
