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
  Label,
} from 'lattice-ui-kit';

import { FullyQualifiedNames } from '../../core/edm/constants';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { BLUE } from '../../utils/constants/Colors';

const {
  PERSON_BIRTH_DATE_FQN,
  PERSON_FIRST_NAME_FQN,
  PERSON_LAST_NAME_FQN,
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

const ScoreItemCardSegment = styled(CardSegment)`
  justify-content: space-between;
  margin-left: 185px; /* = 30px left padding + 50px index width + 30px margin + 45px picture width + 30px margin */
`;

const ScoreHeaderCardSegment = styled(ScoreItemCardSegment)`
  border-bottom: none;
  padding-bottom: 0;
`;

const ScoreItemGrid = styled.div`
  align-items: center;
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 100px;
  grid-column-gap: 30px;

  > span:first-child {
    color: ${BLUE.BLUE_2};
    font-weight: 600;
  }

  > span {
    font-size: 13px;
  }
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

  return (
    <Card onClick={onClickFn}>
      <CardSegment padding="sm">
        <IndexWrapper>{index}</IndexWrapper>
        <UserIconWrapper>
          <FontAwesomeIcon icon={faUser} size="2x" />
        </UserIconWrapper>
        <DataGrid columns={4} data={data} labelMap={labelMap} />
      </CardSegment>
      {
        counts && !counts.isEmpty() && (
          counts.map((countItem, countIndex) => (
            <>
              {
                countIndex === 0 && (
                  <ScoreHeaderCardSegment noBleed padding="sm">
                    <ScoreItemGrid>
                      <Label subtle>SCORE DETAILS</Label>
                      <Label subtle>SCORE</Label>
                    </ScoreItemGrid>
                  </ScoreHeaderCardSegment>
                )
              }
              <ScoreItemCardSegment noBleed padding="sm">
                <ScoreItemGrid>
                  <span>{countItem.get(TOP_UTILIZERS_FILTER.LABEL)}</span>
                  <span>{countItem.get(AT_COUNT_FQN)}</span>
                </ScoreItemGrid>
              </ScoreItemCardSegment>
            </>
          ))
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
