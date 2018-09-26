/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { fromJS } from 'immutable';

import UtilityButton from '../../buttons/UtilityButton';
import NumberInputTable from '../../tables/NumberInputTable';
import { TOP_UTILIZERS_FILTER } from '../../../utils/constants/TopUtilizerConstants';
import {
  DropdownRowWrapper,
  DropdownWrapper,
  DropdownTab,
  TabsContainer
} from '../../layout/Layout';
import { isNotNumber } from '../../../utils/ValidationUtils';

type Props = {
  selectedNeighborTypes :Object[],
  setNeighborTypes :(selectedNeighborTypes :Object[]) => void,
  resetWeights :() => void
};

const RightRowWrapper = styled(DropdownRowWrapper)`
  justify-content: flex-end;
  margin-top: 15px;
`;

const WeightsPicker = ({ selectedNeighborTypes, setNeighborTypes, resetWeights } :Props) => {

  const rows = fromJS(selectedNeighborTypes.map((option, index) => {
    const label = `${option[TOP_UTILIZERS_FILTER.ASSOC_TITLE]} ${option[TOP_UTILIZERS_FILTER.NEIGHBOR_TITLE]}`;
    const value = option[TOP_UTILIZERS_FILTER.WEIGHT];
    const key = index;
    return { key, value, label };
  }));

  const onChange = (index, value) => {
    const formattedValue = value === '.' ? '0.' : value;
    if (!isNotNumber(formattedValue) || formattedValue === '') {
      selectedNeighborTypes[index][TOP_UTILIZERS_FILTER.WEIGHT] = formattedValue;
      setNeighborTypes(selectedNeighborTypes);
    }
  };

  return (
    <DropdownWrapper>
      <TabsContainer>
        <DropdownTab selected>Events</DropdownTab>
      </TabsContainer>
      <RightRowWrapper>
        <UtilityButton onClick={resetWeights}>Reset Weights</UtilityButton>
      </RightRowWrapper>
      <NumberInputTable
          keyHeader="Events"
          valueHeader="Weight"
          rows={rows}
          onChange={onChange} />
    </DropdownWrapper>
  );
};

export default WeightsPicker;
