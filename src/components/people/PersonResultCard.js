/*
 * @flow
 */

import React from 'react';
import styled, { css } from 'styled-components';
import { List, Map } from 'immutable';

import defaultProfileIcon from '../../assets/svg/profile-placeholder-round.svg';
import { PROPERTY_TYPES } from '../../utils/constants/DataModelConstants';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { BLUE } from '../../utils/constants/Colors';
import { FixedWidthWrapper } from '../layout/Layout';
import { formatDateList } from '../../utils/FormattingUtils';

const {
  DATASOURCE,
  FIRST_NAME,
  LAST_NAME,
  DOB,
  MUGSHOT,
  PICTURE
} = PROPERTY_TYPES;

const getHoverStyles = ({ disabled }) => {
  if (!disabled) {
    return css`
      cursor: pointer;
      box-shadow: 0 5px 15px 0 rgba(0, 0, 0, 0.07);
    `;
  }
  return null;
};

const CardWrapper = styled(FixedWidthWrapper)`
  margin: 10px 0;
  height: ${(props) => (props.withCounts ? 'fit-content' : '75px')};
  background-color: #ffffff;
  border: 1px solid #e1e1eb;
  border-radius: 5px;
  display: flex;
  flex-direction: column;

  &:hover {
    ${getHoverStyles}
  }
`;

const DatasourceWrapper = styled.div`
  margin: -5px 0 0 75px;
  display: flex;
  flex-direction: row;

  span {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 5px;
    border-radius: 3px;
    background-color: #e1e1eb;
    font-size: 11px;
    line-height: normal;
    color: #8e929b;
    text-transform: uppercase;

    &:not(:first-child) {
      margin-left: 20px;
    }
  }
`;

const Card = styled(FixedWidthWrapper)`
  padding: 20px 30px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CountCard = styled(Card)`
  border-top: 1px solid #e6e6eb;
  padding-left: 155px;
  flex-direction: column;
`;

const CountRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;

  &:first-child {
    padding: 0;
  }

  &:not(:first-child):not(:last-child) {
    border-bottom: 1px solid #e6e6eb;
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

const Label = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 11px;
  font-weight: 400;
  text-transform: uppercase;
  color: #8e929b;
  margin-bottom: 5px;
`;

const Value = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: ${(props) => (props.blue ? '600' : '400')};
  color: ${(props) => {
    if (props.na) {
      return '#8e929b';
    }
    if (props.blue) {
      return BLUE.BLUE_2;
    }
    return '#2e2e34';
  }};
`;

const ValueWithLabel = styled.div`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width}px;
`;

const getProfileImgSrc = (person) => {
  let image = person.getIn([MUGSHOT, 0], person.getIn([PICTURE, 0]));
  if (!image) {
    image = defaultProfileIcon;
  }
  return image;
};

const renderValueWithLabel = (person, label, field, width, isDate) => {
  const valueList = person.get(field, List());
  const value = isDate ? formatDateList(valueList) : valueList.join(', ');
  return (
    <ValueWithLabel width={width}>
      <Label>{label}</Label>
      {value.length ? <Value>{value}</Value> : <Value na>N/A</Value>}
    </ValueWithLabel>
  );
};

const renderCounts = (counts) => {
  return (
    <CountCard>
      <CountRow>
        <Label>SCORE DETAILS</Label>
        <Label>SCORE</Label>
      </CountRow>
      {counts.map((countItem) => (
        <CountRow key={countItem.get(TOP_UTILIZERS_FILTER.LABEL)}>
          <Value blue>{countItem.get(TOP_UTILIZERS_FILTER.LABEL)}</Value>
          <Value>{countItem.get(COUNT_FQN)}</Value>
        </CountRow>
      ))}
    </CountCard>
  );
};

const renderPersonDetails = (index, person) => {
  if (!person.has(FIRST_NAME) && !person.has(LAST_NAME) && !person.has(DOB)) {
    return null;
  }

  return (
    <Card>
      <ListNumber>{index >= 0 ? index : ''}</ListNumber>
      <ProfileImg src={getProfileImgSrc(person)} />
      {renderValueWithLabel(person, 'FIRST NAME', FIRST_NAME, 180)}
      {renderValueWithLabel(person, 'LAST NAME', LAST_NAME, 330)}
      {renderValueWithLabel(person, 'DATE OF BIRTH', DOB, 100, true)}
      {renderValueWithLabel(person, 'SCORE', COUNT_FQN, 40)}
    </Card>
  );
};

const renderDatasources = (person) => {
  if (!person.has(DATASOURCE)) {
    return null;
  }

  return (
    <DatasourceWrapper>
      {person.get(DATASOURCE, List()).map((datasource) => <span key={datasource}>{datasource}</span>)}
    </DatasourceWrapper>
  );
};

type Props = {
  counts :List<Map<string, number>>;
  index :number;
  onClick :() => void;
  person :Map<*, *>;
};

const PersonResultCard = ({
  counts,
  index,
  person,
  onClick
} :Props) => {
  const disabled = !onClick;
  const onClickFn = disabled ? () => {} : onClick;
  return (
    <CardWrapper disabled={disabled} onClick={onClickFn} withCounts={!!counts}>
      {renderDatasources(person)}
      {renderPersonDetails(index, person)}
      {counts ? renderCounts(counts) : null}
    </CardWrapper>
  );
};

PersonResultCard.defaultProps = {
  counts: null,
  index: -1,
  onClick: undefined,
};

export default PersonResultCard;
