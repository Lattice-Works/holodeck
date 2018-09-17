/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import defaultProfileIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { IMAGE_PREFIX } from '../../utils/constants/DataConstants';
import { FixedWidthWrapper } from '../layout/Layout';
import { formatDateList } from '../../utils/FormattingUtils';

const {
  FIRST_NAME,
  LAST_NAME,
  DOB,
  SEX,
  SSN,
  MUGSHOT,
  PICTURE
} = PROPERTY_TYPES;

const CardWrapper = styled(FixedWidthWrapper)`
  margin: 10px 0;
  height: 215px;
  width: 100%;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ProfileImg = styled.img`
  height: 215px;
  width: 215px;
`;

const Label = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: #8e929b;
  margin-bottom: 5px;
`;

const Value = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  color: ${props => (props.na ? '#8e929b' : '#2e2e34')};
`;

const ValueWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  width: ${props => (props.extraWide ? 66 : 33)}%;
`;

const PersonDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PersonDetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  margin: 20px 50px;
`;

type Props = {
  index? :number,
  person :Map<*, *>
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

const renderValueWithLabel = (person, label, field, isDate, extraWide) => {
  const valueList = person.get(field, List());
  const value = isDate ? formatDateList(valueList) : valueList.join(', ');
  return (
    <ValueWithLabel extraWide={extraWide}>
      <Label>{label}</Label>
      {value.length ? <Value>{value}</Value> : <Value na>N/A</Value>}
    </ValueWithLabel>
  );
};


const renderPersonDetails = (index, person) => {
  if (!person.has(FIRST_NAME) && !person.has(LAST_NAME) && !person.has(DOB)) {
    return null;
  }

  return (
    <PersonDetailsWrapper>

      <PersonDetailsRow>
        {renderValueWithLabel(person, 'LAST NAME', LAST_NAME, false, true)}
        {renderValueWithLabel(person, 'FIRST NAME', FIRST_NAME)}
      </PersonDetailsRow>

      <PersonDetailsRow>
        {renderValueWithLabel(person, 'DATE OF BIRTH', DOB, true)}
        {renderValueWithLabel(person, 'SEX', SEX)}
        {renderValueWithLabel(person, 'SOCIAL SECURITY #', SSN)}
      </PersonDetailsRow>

    </PersonDetailsWrapper>
  );
};

const SelectedPersonResultCard = ({ index, person } :Props) => (
  <CardWrapper>
    <ProfileImg src={getProfileImgSrc(person)} />
    {renderPersonDetails(index, person)}
  </CardWrapper>
);

SelectedPersonResultCard.defaultProps = {
  index: -1
};

export default SelectedPersonResultCard;
