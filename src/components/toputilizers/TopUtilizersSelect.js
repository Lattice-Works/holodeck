/*
 * @flow
 */

import React from 'react';
import Immutable from 'immutable';
import Select, { components } from 'react-select';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-light-svg-icons';


import LoadingDots from '../loading/LoadingDots';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { BLUE } from '../../utils/constants/Colors';

const {
  ASSOC_ID,
  ASSOC_TITLE,
  NEIGHBOR_ID,
  NEIGHBOR_TITLE,
  IS_SRC,
  VALUE,
  LABEL,
  WEIGHT
} = TOP_UTILIZERS_FILTER;

type Props = {
  selectedEntitySet :Immutable.Map<*, *>,
  isLoadingNeighborTypes :boolean,
  neighborTypes :Immutable.List<*>,
  selectedNeighborTypes :[],
  onChange :(neighborTypes :[]) => void
}

const SelectWrapper = styled.div`
  width: 100%;
`;

const BackgroundWrapper = styled.div`
  background-color: transparent;
  padding: ${props => (props.removeButton ? '4px 4px 4px 0' : '4px 0 4px 4px')};
`;

const OptionRow = styled.div`
  padding: 10px 20px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  &:hover {
    background-color: #f0f0f7;
    cursor: pointer;
  }
`;

const OptionEntitySetBox = styled.div`
  background-color: ${props => (props.selected ? BLUE.BLUE_1 : '#f0f0f7')};
  padding: 4px 10px;
  margin: 0 1px;
  font-family: 'Open Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: ${(props) => {
    if (props.selectedEntitySet || props.removeButton) {
      return '#8e929b';
    }
    if (props.selected) {
      return BLUE.BLUE_2;
    }
    return '#2e2e34';
  }};

  ${(props) => {
    if (props.removeButton) {
      return css`
        &:hover {
          cursor: pointer;
          background-color: #8e929b;
          color: #ffffff;
        }
      `;
    }
    return '';
  }}
`;

const SelectedOptionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  background-color: #ffffff;
`;

const LoadingInputPlaceholder = styled.div`
  width: 100%;
  color: #135;
  padding: 10px;
  background-color: hsl(0,0%,100%);
  border-color: hsl(0,0%,80%);
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  height: 38px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    color: #b6bbc7;
  }
`;

export default class TopUtilizersSelect extends React.Component<Props> {

  getEdgeValue = (associationTypeId, neighborTypeId, src) => (src
    ? [associationTypeId, neighborTypeId] : [associationTypeId, neighborTypeId]).join('|');

  getNeighborTypeOptions = neighborTypes => neighborTypes.map((neighborType) => {
    const assocId = neighborType.getIn(['associationEntityType', 'id']);
    const assocTitle = neighborType.getIn(['associationEntityType', 'title']);
    const neighborId = neighborType.getIn(['neighborEntityType', 'id']);
    const neighborTitle = neighborType.getIn(['neighborEntityType', 'title']);
    const src = neighborType.get('src');

    return {
      [VALUE]: this.getEdgeValue(assocId, neighborId, src),
      [LABEL]: (src ? [assocTitle, neighborTitle] : [neighborTitle, assocTitle]).join(' '),
      [ASSOC_ID]: assocId,
      [ASSOC_TITLE]: assocTitle,
      [NEIGHBOR_ID]: neighborId,
      [NEIGHBOR_TITLE]: neighborTitle,
      [IS_SRC]: src,
      [WEIGHT]: 1
    };
  }).toJS();

  selectedNeighborOption = ({ data, innerProps, selectProps }) => {
    const { assocTitle, neighborTitle, src } = data;
    const assoc = <OptionEntitySetBox selected>{assocTitle}</OptionEntitySetBox>;
    const neighbor = <OptionEntitySetBox selected>{neighborTitle}</OptionEntitySetBox>;

    return (
      <BackgroundWrapper>
        <SelectedOptionWrapper {...innerProps} {...selectProps}>
          {src ? assoc : neighbor}
          {src ? neighbor : assoc}
        </SelectedOptionWrapper>
      </BackgroundWrapper>
    );
  }

  removeButton = props => (
    <components.MultiValueRemove {...props}>
      <BackgroundWrapper removeButton>
        <OptionEntitySetBox {...props} removeButton>
          <FontAwesomeIcon icon={faTimes} />
        </OptionEntitySetBox>
      </BackgroundWrapper>
    </components.MultiValueRemove>
  )

  neighborOption = ({ data, innerProps }) => {
    const { selectedEntitySet } = this.props;
    const { assocTitle, neighborTitle, src } = data;
    const entitySetTitle = selectedEntitySet.get('title', '');

    const selectedEntitySetOption = <OptionEntitySetBox selectedEntitySet>{entitySetTitle}</OptionEntitySetBox>;
    const neighborEntitySetOption = <OptionEntitySetBox>{neighborTitle}</OptionEntitySetBox>;

    return (
      <OptionRow {...innerProps}>
        {src ? selectedEntitySetOption : neighborEntitySetOption}
        <OptionEntitySetBox>{assocTitle}</OptionEntitySetBox>
        {src ? neighborEntitySetOption : selectedEntitySetOption}
      </OptionRow>
    );
  }

  renderPlaceholder = () => (
    <LoadingInputPlaceholder>
      <span>Loading...</span>
      <LoadingDots />
    </LoadingInputPlaceholder>
  )

  render() {
    const {
      isLoadingNeighborTypes,
      neighborTypes,
      selectedNeighborTypes,
      onChange
    } = this.props;
    return (
      <SelectWrapper>
        {
          isLoadingNeighborTypes ? this.renderPlaceholder() : (
            <Select
                value={selectedNeighborTypes}
                onChange={onChange}
                options={this.getNeighborTypeOptions(neighborTypes)}
                closeMenuOnSelect={false}
                placeholder="Search"
                styles={{
                  multiValueRemove: base => ({
                    ...base,
                    padding: '0',
                    backgroundColor: 'transparent',
                    height: '0'
                  }),
                  multiValueLabel: base => ({
                    ...base,
                    backgroundColor: 'transparent',
                    paddingRight: '0'
                  }),
                  multiValue: base => ({
                    ...base,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center'
                  })
                }}
                components={{
                  Option: this.neighborOption,
                  MultiValueLabel: this.selectedNeighborOption,
                  MultiValueRemove: this.removeButton
                }}
                clearable
                isMulti />
          )
        }
      </SelectWrapper>
    );
  }
}
