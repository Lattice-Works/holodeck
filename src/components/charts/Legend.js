/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

type Props = {
  colorsByValue :Map<*, *>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const Item = styled.div`
  font-family: 'Open Sans', sans-serif;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: fit-content;

  div:first-child {
    width: 30px;
    height: 2px;
    background-color: ${props => props.color};
  }
`;

const Label = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #8e929b;
  margin: 0 5px;
`;

const Legend = ({ colorsByValue } :Props) => (
  <Wrapper>
    {colorsByValue.entrySeq().map(([value, color]) => (
      <Item color={color} key={value}>
        <div color={color} />
        <Label>{value}</Label>
      </Item>
    ))}
  </Wrapper>
);

export default Legend;
