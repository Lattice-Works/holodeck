/*
 * @flow
 */

import React, { useEffect, useState } from 'react';

import styled from 'styled-components';
import { Select } from 'lattice-ui-kit';
import type { UUID } from 'lattice';

import { useOrgSelectOptions } from './utils';

import type { SelectOption } from '../../types';

const OrgSelect = styled.div`
  flex: 1;
  max-width: 300px;
`;

type Props = {
  onChange :(organizationId :?UUID) => void;
};

const OrgsContainer = ({ onChange } :Props) => {

  const orgOptions :SelectOption[] = useOrgSelectOptions();
  const [selectedOrgOption, setSelectedOrgOption] = useState();

  useEffect(() => {
    if (selectedOrgOption) {
      onChange(selectedOrgOption.value);
    }
    else {
      onChange();
    }
  }, [onChange, selectedOrgOption]);

  return (
    <OrgSelect>
      <Select
          id="orgs"
          isClearable
          onChange={(option) => setSelectedOrgOption(option)}
          value={selectedOrgOption}
          options={orgOptions} />
    </OrgSelect>
  );
};

export default OrgsContainer;
