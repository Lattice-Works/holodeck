/*
 * @flow
 */

import React from 'react';

import { List, Map } from 'immutable';
import { Models } from 'lattice';

import StyledCheckbox from '../../controls/StyledCheckbox';
import { PropertyTypeCheckboxWrapper } from '../../layout/Layout';

const { FullyQualifiedName } = Models;

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
      const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
      const title = propertyType.get('title');
      return (
        <div key={propertyTypeFQN}>
          <StyledCheckbox
              checked={!filteredPropertyTypes.has(propertyTypeFQN)}
              value={propertyTypeFQN}
              label={title}
              onChange={onPropertyTypeChange} />
        </div>
      );
    })}
  </PropertyTypeCheckboxWrapper>
);

export default PropertyTypeFilterOptions;
