/*
 * @flow
 */

import React from 'react';

import { List } from 'immutable';

import StyledCheckbox from '../../controls/StyledCheckbox';
import { PropertyTypeCheckboxWrapper } from '../../layout/Layout';
import { getFqnString } from '../../../utils/DataUtils';

type Props = {
  selectedEntitySetPropertyTypes :List<*>,
  filteredPropertyTypes :List<*>,
  onPropertyTypeChange :(propertyTypeId :string) => void
}

const PropertyTypeFilterOptions = ({
  selectedEntitySetPropertyTypes,
  filteredPropertyTypes,
  onPropertyTypeChange
} :Props) => (
  <PropertyTypeCheckboxWrapper>
    {selectedEntitySetPropertyTypes.map((propertyType) => {
      const fqn = getFqnString(propertyType.get('type'));
      const title = propertyType.get('title');
      return (
        <div key={fqn}>
          <StyledCheckbox
              checked={!filteredPropertyTypes.has(fqn)}
              value={fqn}
              label={title}
              onChange={onPropertyTypeChange} />
        </div>
      );
    })}
  </PropertyTypeCheckboxWrapper>
);

export default PropertyTypeFilterOptions;
