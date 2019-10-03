/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { Map } from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import PersonPicture from './PersonPicture';
import { FullyQualifiedNames } from '../../core/edm/constants';

const {
  PERSON_BIRTH_DATE_FQN,
  PERSON_FIRST_NAME_FQN,
  PERSON_LAST_NAME_FQN,
  PERSON_SEX_FQN,
  PERSON_SSN_FQN,
} = FullyQualifiedNames.PROPERTY_TYPE_FQNS;

const NoPaddingCardSegment = styled(CardSegment)`
  padding: 0;
`;

const DataGridWrapper = styled.div`
  flex: 1;
  padding: 30px;
`;

const UtilizerTagWrapper = styled.div`
  align-items: flex-end;
  display: flex;
  height: 200px; /* expected to be size of picture */
  justify-content: center;
  position: absolute;
  width: 200px; /* expected to be size of picture */
`;

const UtilizerTag = styled.div`
  background-color: #ffffff;
  border-radius: 15px;
  bottom: 10px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
  color: #2e2e34;
  font-size: 12px;
  font-weight: bold;
  padding: 7px 10px;
  position: relative;
  text-transform: uppercase;
`;

type Props = {
  index :number;
  person :Map;
};

const labelMap = Map({
  [PERSON_FIRST_NAME_FQN]: 'FIRST NAME',
  [PERSON_LAST_NAME_FQN]: 'LAST NAME',
  [PERSON_SEX_FQN]: 'SEX',
  [PERSON_BIRTH_DATE_FQN]: 'DATE OF BIRTH',
  [PERSON_SSN_FQN]: 'SSN',
});

const SelectedPersonResultCard = ({ index, person } :Props) => (
  <Card>
    <NoPaddingCardSegment>
      <PersonPicture person={person} size="xl" />
      {
        index !== undefined && (
          <UtilizerTagWrapper>
            <UtilizerTag>{`#${index} Utilizer`}</UtilizerTag>
          </UtilizerTagWrapper>
        )
      }
      <DataGridWrapper>
        <DataGrid columns={3} data={person} labelMap={labelMap} />
      </DataGridWrapper>
    </NoPaddingCardSegment>
  </Card>
);

SelectedPersonResultCard.defaultProps = {
  index: -1,
};

export default SelectedPersonResultCard;
