/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import defaultProfileIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { COUNT_FQN, IMAGE_PREFIX } from '../../utils/constants/DataConstants';
import { formatDateList } from '../../utils/FormattingUtils';

const {
  FIRST_NAME,
  LAST_NAME,
  DOB,
  MUGSHOT,
  PICTURE
} = PROPERTY_TYPES;

const Card = styled.div`
  width: 960px;
  height: 75px;
  padding: 20px 30px;
  margin: 10px 0;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  &:hover {
    cursor: pointer;
    box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.07);
  }
`;

const ListNumber = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #2e2e34;
`;

const ProfileImg = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 100%;
`;

const NA = styled.div`
  color: #8e929b !important;
`;

const ValueWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => props.width}px;

  span {
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 400;
    text-transform: uppercase;
    color: #8e929b;
    margin-bottom: 5px;
  }

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 13px;
    color: #2e2e34;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

type Props = {
  index :number,
  person :Map<*, *>,
  onClick :() => void
};

const getProfileImgSrc = (person) => {
  let image = person.getIn([MUGSHOT, 0], person.getIn([PICTURE, 0]));
  if (!image) {
    image = defaultProfileIcon;
  }
  else if (!image.startsWith(IMAGE_PREFIX)) {
    image = `${IMAGE_PREFIX}${image}`;
  }
  return image;
};

const renderValueWithLabel = (person, label, field, width, isDate) => {
  const valueList = person.get(field, List());
  const value = isDate ? formatDateList(valueList) : valueList.join(', ');
  return (
    <ValueWithLabel width={width}>
      <span>{label}</span>
      {value.length ? <div>{value}</div> : <NA>N/A</NA>}
    </ValueWithLabel>
  );
};

const PersonResultCard = ({ index, person, onClick } :Props) => (

  <Card onClick={onClick}>
    <ListNumber>{index}</ListNumber>
    <ProfileImg src={getProfileImgSrc(person)} />
    {renderValueWithLabel(person, 'FIRST NAME', FIRST_NAME, 180)}
    {renderValueWithLabel(person, 'LAST NAME', LAST_NAME, 330)}
    {renderValueWithLabel(person, 'DATE OF BIRTH', DOB, 100, true)}
    {renderValueWithLabel(person, 'COUNT', COUNT_FQN, 40)}
  </Card>
);

export default PersonResultCard;
