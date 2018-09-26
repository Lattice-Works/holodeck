/*
 * @flow
 */

import React from 'react';

import StyledCheckbox from '../../controls/StyledCheckbox';
import { PropertyTypeCheckboxWrapper } from '../../layout/Layout';

type Props = {
  selectedEntitySetPropertyTypes :List<*>,
  selectedPropertyTypes :List<*>,
  onPropertyTypeChange :(propertyTypeId :string) => void
}

const PropertyTypeFilterOptions = ({
  selectedEntitySetPropertyTypes,
  selectedPropertyTypes,
  onPropertyTypeChange
} :Props) => (
  <PropertyTypeCheckboxWrapper>
    {selectedEntitySetPropertyTypes.map((propertyType) => {
      const id = propertyType.get('id');
      const title = propertyType.get('title');
      return (
        <div key={id}>
          <StyledCheckbox
              checked={selectedPropertyTypes.has(id)}
              value={id}
              label={title}
              onChange={onPropertyTypeChange} />
        </div>
      );
    })}
  </PropertyTypeCheckboxWrapper>
);

export default PropertyTypeFilterOptions;
