/*
 * @flow
 */

import React from 'react';

import styled, { css } from 'styled-components';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { StyleUtils } from 'lattice-ui-kit';

import { FullyQualifiedNames } from '../../core/edm/constants';

const { getStyleVariation } = StyleUtils;

const {
  PERSON_MUGSHOT_FQN,
  PERSON_PICTURE_FQN,
} = FullyQualifiedNames.PROPERTY_TYPE_FQNS;

const getPictureDimensions = getStyleVariation('size', {
  sm: css`
    height: 45px;
    width: 45px;
  `,
  md: css`
    height: 70px;
    width: 70px;
  `,
  xl: css`
    height: 200px;
    width: 200px;
  `,
});

const getFontSize = getStyleVariation('size', {
  sm: '21px',
  md: '36px',
  xl: '100px'
});

const PictureWrapper = styled.div`
  border-radius: ${({ round }) => (round ? '50%' : 0)};
  display: flex;
  overflow: hidden;
  position: relative;
  ${getPictureDimensions}
`;

const UserIconWrapper = styled.div`
  align-items: center;
  background-color: #e9ecef;
  color: white;
  display: flex;
  flex: 1;
  font-size: ${getFontSize};
  justify-content: center;
`;

type Props = {
  person :Map;
  round ?:boolean;
  size ?:string;
  overlay ?:object;
};

const PersonPicture = (props :Props) => {
  const {
    person,
    round,
    size,
    overlay
  } = props;
  const image = person.getIn([PERSON_MUGSHOT_FQN, 0], person.getIn([PERSON_PICTURE_FQN, 0]));
  if (!image) {
    return (
      <PictureWrapper round={round} size={size}>
        <UserIconWrapper size={size}>
          <FontAwesomeIcon icon={faUser} />
        </UserIconWrapper>
        {overlay}
      </PictureWrapper>
    );
  }
  return (
    <PictureWrapper>
      <img alt="" src={image} />
      {overlay}
    </PictureWrapper>
  );
};

PersonPicture.defaultProps = {
  round: false,
  size: 'sm',
};

export default PersonPicture;
