/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';

import { FullyQualifiedNames } from '../../core/edm/constants';

const {
  PERSON_MUGSHOT_FQN,
  PERSON_PICTURE_FQN,
} = FullyQualifiedNames.PROPERTY_TYPE_FQNS;

const SizeMap = {
  sm: {
    font: '21px',
    pixels: '45px',
  },
  md: {
    font: '36px',
    pixels: '70px',
  },
  xl: {
    font: '100px',
    pixels: '200px',
  },
};

const PictureWrapper = styled.div`
  border-radius: ${({ round }) => (round ? '50%' : 0)};
  display: flex;
  height: ${({ size }) => SizeMap[size].pixels};
  overflow: hidden;
  position: relative;
  width: ${({ size }) => SizeMap[size].pixels};
`;

const UserIconWrapper = styled.div`
  align-items: center;
  background-color: #e9ecef;
  color: white;
  display: flex;
  font-size: ${({ size }) => SizeMap[size].font};
  flex: 1;
  justify-content: center;
`;

type Props = {
  person :Map;
  round :boolean;
  size :string;
};

const PersonPicture = (props :Props) => {
  const { person, round, size = 'sm' } = props;
  const image = person.getIn([PERSON_MUGSHOT_FQN, 0], person.getIn([PERSON_PICTURE_FQN, 0]));
  if (!image) {
    return (
      <PictureWrapper round={round} size={size}>
        <UserIconWrapper size={size}>
          <FontAwesomeIcon icon={faUser} />
        </UserIconWrapper>
      </PictureWrapper>
    );
  }
  return (
    <PictureWrapper>
      <img alt="" src={image} />
    </PictureWrapper>
  );
};

export default PersonPicture;
