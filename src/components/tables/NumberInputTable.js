/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';

type Props = {
  keyHeader :string,
  valueHeader :string,
  rows :List<*>,
  withDollarSign? :boolean,
  onChange :() => void
};

const Table = styled.table.attrs({
  cellSpacing: 0
})`
  margin: 20px 0;
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  color: #2e2e34;
  text-align: left;
  font-weight: 400;

  &:last-child {
    width: 85px;
    text-align: center;
  }
`;

const StyledCell = styled.td`
  width: 100%;
  text-align: left;
  padding: ${props => (props.withInput ? '0' : '6px 15px')};
  margin: 0;

  input {
    width: 80px;
    background: transparent;
    width: 100%;
    height: 100%;
    padding: 6px 15px;
    border: none;

    &:focus {
      outline: none;
    }
  }
`;

const Row = styled.tr`

  &:nth-child(even) {
    background-color: #f8f8fb;
  }

  &:nth-child(odd) {
    background-color: #ffffff;
  }

  ${StyledCell}:first-child {
    border-left: 1px solid #e1e1eb;
  }

  ${StyledCell} {
    border-right: 1px solid #e1e1eb;
    border-bottom: 1px solid #e1e1eb;
  }
`;

const HeaderRow = styled(Row)`
  color: #2e2e34;

  ${StyledCell} {
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #2e2e34;
    font-weight: 600;
  }
`;

const NumberInputTable = ({
  keyHeader,
  valueHeader,
  rows,
  onChange,
  withDollarSign
} :Props) => {

  const onInputChange = (e, key) => {
    const { value } = e.target;
    const valueStr = (withDollarSign && value.startsWith('$')) ? value.slice(1) : value;
    onChange(key, valueStr);
  };

  return (
    <Table>
      <tbody>
        <HeaderRow>
          <StyledCell>{keyHeader}</StyledCell>
          <StyledCell>{valueHeader}</StyledCell>
        </HeaderRow>
        {rows.map((row) => {
          const key = row.get('key');
          const label = row.get('label');
          const value = row.get('value');

          const formattedValue = withDollarSign ? `$${value}` : `${value}`;

          return (
            <Row key={key}>
              <StyledCell>{label}</StyledCell>
              <StyledCell withInput>
                <input value={formattedValue} onChange={e => onInputChange(e, key)} />
              </StyledCell>
            </Row>
          );
        })}
      </tbody>
    </Table>
  );
};

NumberInputTable.defaultProps = {
  withDollarSign: false
};

export default NumberInputTable;
