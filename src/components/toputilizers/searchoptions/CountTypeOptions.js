/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';

import StyledCheckbox from '../../controls/StyledCheckbox';
import StyledRadio from '../../controls/StyledRadio';
import {
  DropdownWrapper,
  DropdownRowWrapper,
  PropertyTypeCheckboxWrapper,
  RadioTitle
} from '../../layout/Layout';
import { COUNT_TYPES } from '../../../utils/constants/TopUtilizerConstants';

const TopBorderRowWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  margin-top: 20px;
  border-top: 1px solid #e6e6eb;

  div {
    font-family: 'Open Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #555e6f;
  }
`;

type Props = {
  entityTypesById :Map<string, *>,
  propertyTypesById :Map<string, *>,
  countType :string,
  durationTypeWeights :Map<*, *>,
  selectedNeighborTypes :Object[],
  availableDurationProperties :Map<*, *>,
  onChange :(e :Object) => void,
  onDurationWeightChange :(newWeights :Map<*, *>) => void
}

const CountTypeOptions = ({
  entityTypesById,
  propertyTypesById,
  countType,
  durationTypeWeights,
  selectedNeighborTypes,
  availableDurationProperties,
  onChange,
  onDurationWeightChange
} :Props) => {

  const isDisabled = !availableDurationProperties.size
    || availableDurationProperties.size !== selectedNeighborTypes.length;

  return (
    <DropdownWrapper>
      <RadioTitle>Count Type</RadioTitle>
      <DropdownRowWrapper radioHalfSize>
        <StyledRadio
            checked={countType === COUNT_TYPES.EVENTS}
            value={COUNT_TYPES.EVENTS}
            onChange={onChange}
            label="Events" />
        <StyledRadio
            disabled={isDisabled}
            checked={countType === COUNT_TYPES.DURATION}
            value={COUNT_TYPES.DURATION}
            onChange={onChange}
            label="Duration" />
      </DropdownRowWrapper>
      {
        countType === COUNT_TYPES.DURATION ? (
          <DropdownWrapper noPadding>
            <TopBorderRowWrapper>
              <div>Properties to include</div>
            </TopBorderRowWrapper>
            <PropertyTypeCheckboxWrapper twoCols>
              {availableDurationProperties.entrySeq().flatMap(([pair, propertyTypeIds]) => {
                const assocTitle = entityTypesById.getIn([pair.get(0), 'title'], '');
                const neighborTitle = entityTypesById.getIn([pair.get(1), 'title'], '');

                return propertyTypeIds.map((propertyTypeId) => {
                  const weight = durationTypeWeights.getIn([pair, propertyTypeId], 0);
                  const propertyTypeTitle = propertyTypesById.getIn([propertyTypeId, 'title'], '');
                  const label = `${assocTitle} ${neighborTitle} -- ${propertyTypeTitle}`;
                  const onDurationChange = (e) => {
                    const { checked } = e.target;
                    const newWeight = checked ? 1 : 0;
                    onDurationWeightChange(durationTypeWeights.setIn([pair, propertyTypeId], newWeight));
                  };
                  return (
                    <div key={label}>
                      <StyledCheckbox
                          checked={weight > 0}
                          label={label}
                          onChange={onDurationChange} />
                    </div>
                  );
                });
              })}
            </PropertyTypeCheckboxWrapper>
          </DropdownWrapper>
        ) : null
      }
    </DropdownWrapper>
  );
};

export default CountTypeOptions;
