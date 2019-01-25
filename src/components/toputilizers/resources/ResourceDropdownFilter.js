/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Select, { components } from 'react-select';

type Props = {
  value :string,
  label :string,
  options :Object[],
  onChange :(e :Object) => void,
  withMargin? :boolean
};

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 30px;
  &:not(:last-child) {
    margin-right: ${props => (props.withMargin ? 20 : 0)}px;
  }
`;

const SelectLabel = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 14px;
  color: #555e6f;
  margin-bottom: 10px;
`;

const WideSelect = styled(Select)`
  width: 100%;
`;

const StyledOption = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 20px;
  background-color: transparent;
  color: #555e6f;
  font-family: 'Open Sans';
  font-size: 14px;
  margin-bottom: ${props => (props.selected ? 0 : '10px')};

  &:hover {
    background-color: ${props => (props.selected ? 'transparent' : '#f0f0f7')};
    cursor: pointer;
  }

  span {
    width: 30px;
    text-align: left;
    font-weight: 600;
  }
`;

const renderOption = (data, selected, onClick) => (
  <StyledOption selected={selected} onClick={onClick ? onClick : () => {}}>
    {data.num > 0 ? <span>{data.num}</span> : null}
    <div>{data.label}</div>
  </StyledOption>
);

const Option = (props) => {
  const { setValue, data } = props;
  return renderOption(data, false, () => setValue(data), !!data.num);
};

const SingleValue = (props) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      {renderOption(data, true, null, !!data.num)}
    </components.SingleValue>
  );
};

const ResourceDropdownFilter = ({
  value,
  label,
  options,
  onChange,
  withMargin
} :Props) => (
  <SelectWrapper withMargin={withMargin}>
    <SelectLabel>{label}</SelectLabel>
    <WideSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Select"
        isClearable={false}
        components={{ Option, SingleValue }}
        styles={{
          container: base => ({
            ...base,
            outline: 'none',
            border: '0'
          })
        }} />
  </SelectWrapper>
);

ResourceDropdownFilter.defaultProps = {
  withMargin: false
}

export default ResourceDropdownFilter;
