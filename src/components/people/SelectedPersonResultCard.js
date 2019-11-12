/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import { Card, CardSegment, DataGrid } from 'lattice-ui-kit';

import { FullyQualifiedNames } from '../../core/edm/constants';

const {
  PERSON_BIRTH_DATE_FQN,
  PERSON_FIRST_NAME_FQN,
  PERSON_LAST_NAME_FQN,
  PERSON_MUGSHOT_FQN,
  PERSON_PICTURE_FQN,
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

const PictureWrapper = styled.div`
  display: flex;
  height: 242px;
  position: relative;
  width: 242px;
`;

const UserIconWrapper = styled.div`
  align-items: center;
  background-color: #e9ecef;
  color: white;
  display: flex;
  flex: 1;
  justify-content: center;
`;

const UtilizerTag = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: fit-content;
  padding: 7px 10px;
  border-radius: 15px;
  background-color: #ffffff;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
  font-family: 'Open Sans', sans-serif;
  font-size: 12px;
  font-weight: bold;
  color: #2e2e34;
  text-transform: uppercase;
`;

type Props = {
  index :number;
  person :Map;
};

const renderPersonPicture = (person) => {
  const image = person.getIn([PERSON_MUGSHOT_FQN, 0], person.getIn([PERSON_PICTURE_FQN, 0]));
  if (!image) {
    return (
      <UserIconWrapper>
        <FontAwesomeIcon icon={faUser} size="7x" />
      </UserIconWrapper>
    );
  }
  return (
    <img alt="" src={image} />
  );
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
      <PictureWrapper>
        {renderPersonPicture(person)}
        {
          index !== undefined && (
            <UtilizerTag>{`#${index} Utilizer`}</UtilizerTag>
          )
        }
      </PictureWrapper>
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
