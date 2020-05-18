/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { faEmptySet } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Colors } from 'lattice-ui-kit';

import { ErrorCardSegment } from '../cards';

const { NEUTRALS } = Colors;

const DEFAULT_MESSAGE = 'Make sure you are a member of an organization and have permissions.';

const NoSearchResults = styled.span`
  color: ${NEUTRALS[1]};
`;

type Props = {
  message ?:string;
};

const NoSearchResultsCardSegment = ({ message } :Props) => (
  <ErrorCardSegment vertical>
    <FontAwesomeIcon icon={faEmptySet} size="3x" />
    <NoSearchResults>No search results.</NoSearchResults>
    <span>{message}</span>
  </ErrorCardSegment>
);

NoSearchResultsCardSegment.defaultProps = {
  message: DEFAULT_MESSAGE,
};

export default NoSearchResultsCardSegment;
