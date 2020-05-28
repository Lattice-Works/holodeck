/*
 * @flow
 */

import React from 'react';
import styled from 'styled-components';
import { faUser } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { List, Map } from 'immutable';
import {
  Card,
  CardSegment,
  DataGrid,
} from 'lattice-ui-kit';

import PersonScoreCard from './PersonScoreCard';
import { FullyQualifiedNames } from '../../core/edm/constants';

const {
  PERSON_BIRTH_DATE_FQN,
  PERSON_FIRST_NAME_FQN,
  PERSON_LAST_NAME_FQN,
  PERSON_MUGSHOT_FQN,
} = FullyQualifiedNames.PROPERTY_TYPE_FQNS;

const { AT_COUNT_FQN } = FullyQualifiedNames.RESERVED_FQNS;

const IndexWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin: 0 30px 0 0;
  width: 50px;
`;

const UserIconWrapper = styled.div`
  align-items: center;
  align-self: center;
  background-color: #e9ecef;
  border-radius: 50%;
  color: white;
  display: flex;
  font-size: 12px;
  height: 45px;
  justify-content: center;
  margin: 0 30px 0 0;
  width: 45px;
`;

const ProfileImage = styled.img`
  height: 45px;
  width: 45px;
  min-height: 45px;
  min-width: 45px;
  border-radius: 50%;
`;

const labelMap = Map({
  [PERSON_FIRST_NAME_FQN]: 'FIRST NAME',
  [PERSON_LAST_NAME_FQN]: 'LAST NAME',
  [PERSON_BIRTH_DATE_FQN]: 'DATE OF BIRTH',
  [AT_COUNT_FQN]: 'SCORE',
});

type Props = {
  counts :List;
  index :number;
  onClick :() => void;
  person :Map;
};

const PersonResultCard = ({
  counts,
  index,
  person,
  onClick
} :Props) => {

  const disabled = !onClick;
  const onClickFn = disabled ? () => {} : onClick;

  const data = Map({
    [PERSON_FIRST_NAME_FQN]: person.get(PERSON_FIRST_NAME_FQN),
    [PERSON_LAST_NAME_FQN]: person.get(PERSON_LAST_NAME_FQN),
    [PERSON_BIRTH_DATE_FQN]: person.get(PERSON_BIRTH_DATE_FQN),
    [AT_COUNT_FQN]: person.get(AT_COUNT_FQN),
  });

  const imageSrc = person.getIn([PERSON_MUGSHOT_FQN, 0]);
  const profileImg = imageSrc ? <ProfileImage src={imageSrc} /> : <FontAwesomeIcon icon={faUser} size="2x" />;

  return (
    <Card onClick={onClickFn}>
      <CardSegment padding="sm">
        <IndexWrapper>{index}</IndexWrapper>
        <UserIconWrapper>
          {profileImg}
        </UserIconWrapper>
        <DataGrid columns={4} data={data} labelMap={labelMap} />
      </CardSegment>
      {
        counts && !counts.isEmpty() && (
          <PersonScoreCard asCardSegment counts={counts} />
        )
      }
    </Card>
  );
};

PersonResultCard.defaultProps = {
  counts: undefined,
  index: -1,
  onClick: undefined,
};

export default PersonResultCard;
