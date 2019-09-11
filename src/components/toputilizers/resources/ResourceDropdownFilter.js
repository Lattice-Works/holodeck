/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import Select, { components } from 'react-select';

const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  margin-top: 30px;
  &:not(:last-child) {
    margin-right: ${(props) => (props.withMargin ? 20 : 0)}px;
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
  margin-bottom: ${(props) => (props.selected ? 0 : '10px')};

  &:hover {
    background-color: ${(props) => (props.selected ? 'transparent' : '#f0f0f7')};
    cursor: pointer;
  }

  span {
    width: 30px;
    text-align: left;
    font-weight: 600;
  }
`;

const noop = () => {};

const renderOption = (data, selected, onClick = noop) => (
  <StyledOption selected={selected} onClick={onClick}>
    {data.num > 0 ? <span>{data.num}</span> : null}
    <div>{data.label}</div>
  </StyledOption>
);

const Option = (props :any) => {
  const { setValue, data } = props;
  return renderOption(data, false, () => setValue(data));
};

const SingleValue = (props :any) => {
  const { data } = props;
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <components.SingleValue {...props}>
      {renderOption(data, true)}
    </components.SingleValue>
  );
  /* eslint-enable */
};


type Props = {
  label :string;
  onChange :(e :Object) => void;
  options :Object[];
  value :string;
  withMargin? :boolean;
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
          container: (base) => ({
            ...base,
            outline: 'none',
            border: '0'
          })
        }} />
  </SelectWrapper>
);

ResourceDropdownFilter.defaultProps = {
  withMargin: false
};

export default ResourceDropdownFilter;
