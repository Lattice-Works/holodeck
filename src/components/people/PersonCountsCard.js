/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { List, Map } from 'immutable';

import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { BLUE } from '../../utils/constants/Colors';
import { FixedWidthWrapper } from '../layout/Layout';

const CardWrapper = styled(FixedWidthWrapper)`
  margin: 10px 0;
  height: fit-content;
  background-color: #ffffff;
  border: 1px solid #e1e1eb;
  border-radius: 5px;
  display: flex;
  flex-direction: column
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
  flex-direction: column;
`;

const CountRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;

  &:not(:first-child):not(:last-child) {
    border-bottom: 1px solid #e6e6eb;
  }
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
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${(props) => (props.blue ? BLUE.BLUE_2 : '#2e2e34')};

  &:last-child {
    font-weight: 400;
  }
`;

type Props = {
  counts :List<Map<string, number>>,
  total :number
};

const PersonCountsCard = ({ counts, total } :Props) => (
  <CardWrapper>
    <CountCard>
      <CountRow>
        <Label>COUNT DETAILS</Label>
        <Label>COUNT</Label>
      </CountRow>
      <CountRow>
        <Value>Total</Value>
        <Value>{total}</Value>
      </CountRow>
      {counts.map((countItem) => (
        <CountRow key={countItem.get(TOP_UTILIZERS_FILTER.LABEL)}>
          <Value blue>{countItem.get(TOP_UTILIZERS_FILTER.LABEL)}</Value>
          <Value>{countItem.get(COUNT_FQN)}</Value>
        </CountRow>
      ))}
    </CountCard>
  </CardWrapper>
);


export default PersonCountsCard;
