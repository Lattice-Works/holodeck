/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Models } from 'lattice';
import { Label } from 'lattice-ui-kit';
import { LangUtils } from 'lattice-utils';

const { PropertyType } = Models;
const { isNonEmptyArray } = LangUtils;

const DataGrid = styled.div`
  display: grid;
  flex: 1;
  font-size: 14px;
  grid-gap: 20px 30px;
  grid-template-columns: repeat(auto-fill, minmax(250px, auto));

  > div {
    max-width: 500px;
    word-break: break-word;
  }
`;

const ValueList = styled.ul`
  list-style-position: inside;
  list-style-type: ${({ size }) => (size > 1 ? 'disc' : 'none')};
  margin: 0;
  padding-left: 2px;
`;

type Props = {
  data :Object;
  propertyTypes :PropertyType[];
};

const EntityDataGrid = ({ data, propertyTypes } :Props) => {

  const labels = {};
  propertyTypes.forEach((propertyType) => {
    labels[propertyType.type.toString()] = propertyType.title;
  });

  const items = propertyTypes.map((propertyType :PropertyType) => {

    const values :any[] = data[propertyType.type];

    let elements = [];
    if (isNonEmptyArray(values)) {
      elements = values.map((value, index) => (
        <li key={index.toString()}>{value}</li>
      ));
    }
    else {
      elements = [(
        <li key="0">---</li>
      )];
    }

    return (
      <div key={propertyType.type.toString()}>
        <Label subtle>{propertyType.title}</Label>
        <ValueList size={elements.length}>{elements}</ValueList>
      </div>
    );
  });


  return (
    <DataGrid>{items}</DataGrid>
  );
};

export default EntityDataGrid;
