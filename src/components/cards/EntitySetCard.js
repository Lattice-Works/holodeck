import React from 'react';
import Immutable from 'immutable';
import styled from 'styled-components';

type Props = {
  entitySet :Immutable.Map<*, *>,
  onClick :(entitySet :Immutable.Map<*, *>) => void
}

const Card = styled.div`
  width: 470px;
  height: 180px;
  margin: 10px;
  padding: 25px;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #dcdce7;

  &:hover {
    cursor: pointer;
    background-color: #f9f9fd;
  }

  h1 {
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #2e2e34;
    margin-bottom: 15px;
  }

  span {
    margin-top: 20px;
    font-family: 'Open Sans', sans-serif;
    font-size: 12px;
    color: #8e929b;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const EntitySetCard = ({ entitySet, onClick } :Props) => (
  <Card onClick={onClick}>
    <h1>{entitySet.get('title', '')}</h1>
    <span>{entitySet.get('description', '')}</span>
    <span>{entitySet.get('contacts', '')}</span>
  </Card>
);

export default EntitySetCard;
