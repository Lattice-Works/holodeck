/*
 * @flow
 */

import React, { Component } from 'react';
import styled from 'styled-components';
import { List } from 'immutable';
import { Card, CardSegment, Label } from 'lattice-ui-kit';

import { FullyQualifiedNames } from '../../core/edm/constants';
import { BLUE } from '../../utils/constants/Colors';
import { TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';

const { AT_COUNT_FQN } = FullyQualifiedNames.RESERVED_FQNS;

const ScoreCard = styled(Card)`
  padding: 20px 0;
`;

const ScoreItemGrid = styled.div`
  align-items: center;
  display: grid;
  flex: 1;
  grid-template-columns: 1fr 100px;
  grid-column-gap: 30px;

  > h4 {
    font-weight: normal;
    margin: 0;
  }

  > span:first-child {
    color: ${BLUE.BLUE_2};
    font-weight: 600;
  }

  > span {
    font-size: 13px;
  }
`;

type Props = {
  asCardSegment :boolean;
  counts :List;
  total :?number;
};

class PersonScoreCard extends Component<Props> {

  static defaultProps = {
    asCardSegment: false,
    total: undefined,
  }

  renderScore = () => {

    const { counts, total } = this.props;

    return (
      <>
        <CardSegment noBleed padding="sm" vertical>
          <ScoreItemGrid>
            <Label subtle>SCORE DETAILS</Label>
            <Label subtle>SCORE</Label>
          </ScoreItemGrid>
          {
            typeof total === 'number' && (
              <ScoreItemGrid>
                <h4>Total</h4>
                <h4>{total}</h4>
              </ScoreItemGrid>
            )
          }
        </CardSegment>
        {
          counts && !counts.isEmpty() && (
            counts.map((countItem) => (
              <CardSegment noBleed padding="sm">
                <ScoreItemGrid>
                  <span>{countItem.get(TOP_UTILIZERS_FILTER.LABEL)}</span>
                  <span>{countItem.get(AT_COUNT_FQN)}</span>
                </ScoreItemGrid>
              </CardSegment>
            ))
          )
        }
      </>
    );
  };

  render() {

    const { asCardSegment } = this.props;
    if (asCardSegment) {
      return this.renderScore();
    }

    return (
      <ScoreCard>
        {this.renderScore()}
      </ScoreCard>
    );
  }
}


export default PersonScoreCard;
