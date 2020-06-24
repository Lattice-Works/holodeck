/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
import { Cell, Colors, StyleUtils } from 'lattice-ui-kit';
import { useGoToRoute } from 'lattice-utils';

import { DataUtils } from '../../core/data';
import { Routes } from '../../core/router';

const { NEUTRALS } = Colors;

const StyledTableRow = styled.tr`
  background-color: transparent;
  border-bottom: 1px solid ${NEUTRALS[4]};
  ${StyleUtils.getHoverStyles};
`;

type Props = {
  data :Object;
  entitySetId :UUID;
  headers :Object[];
};

const EntityDataRow = ({ data, entitySetId, headers } :Props) => {

  const entityKeyId :UUID = (DataUtils.getEntityKeyId(data) :any);

  const cells = headers.map((header) => (
    <Cell key={`${entityKeyId}_cell_${header.key}`}>{data[header.key]}</Cell>
  ));

  const goToEntityData = useGoToRoute(
    Routes.ENTITY_DATA.replace(Routes.ESID_PARAM, entitySetId).replace(Routes.EKID_PARAM, entityKeyId),
    { data },
  );

  return (
    <StyledTableRow onClick={goToEntityData}>
      {cells}
    </StyledTableRow>
  );
};

export default EntityDataRow;
