/*
 * @flow
 */

import React, { Component } from 'react';

import isFunction from 'lodash/isFunction';
import styled from 'styled-components';
import { faLink } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map } from 'immutable';
import {
  Card,
  CardSegment,
  Colors,
  IconButton,
} from 'lattice-ui-kit';

import { PersonPicture } from '../../../components';
import { FullyQualifiedNames } from '../../../core/edm/constants';

const { NEUTRALS } = Colors;

const {
  OL_DATA_SOURCE_FQN,
  PERSON_BIRTH_DATE_FQN,
  PERSON_ETHNICITY_FQN,
  PERSON_FIRST_NAME_FQN,
  PERSON_LAST_NAME_FQN,
  PERSON_RACE_FQN,
  PERSON_SEX_FQN,
} = FullyQualifiedNames.PROPERTY_TYPE_FQNS;

const ResultDetailsGrid = styled.div`
  display: grid;
  font-size: 14px;
  font-weight: normal;
  grid-column-gap: 30px;
  grid-row-gap: 10px;
  grid-template-columns: 1fr 2fr;

  > h4 {
    color: ${NEUTRALS[1]};
    font-weight: 600;
    margin: 0;
  }
`;

const PictureAndButtonsWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const LinkIcon = (
  <FontAwesomeIcon fixedWidth icon={faLink} transform={{ rotate: 45 }} />
);

type Props = {
  entity :Map;
  entitySetTitle :string;
  isLinked :boolean;
  onClickLink ?:() => void;
  onClickUnlink ?:() => void;
  showSources :boolean;
};

class EntityLinkingCard extends Component<Props> {

  static defaultProps = {
    onClickLink: () => {},
    onClickUnlink: () => {},
    showSources: true,
  }

  handleOnClick = () => {

    const {
      isLinked,
      onClickLink,
      onClickUnlink,
    } = this.props;

    if (isLinked && isFunction(onClickLink)) {
      onClickLink();
    }
    else if (isFunction(onClickUnlink)) {
      onClickUnlink();
    }
  }


  render() {

    const {
      entity,
      entitySetTitle,
      isLinked,
      showSources,
    } = this.props;

    return (
      <Card>
        <CardSegment vertical>
          <PictureAndButtonsWrapper>
            <PersonPicture person={entity} round size="md" />
            <IconButton icon={LinkIcon} onClick={this.handleOnClick}>
              {isLinked ? 'Unlink' : 'Link'}
            </IconButton>
          </PictureAndButtonsWrapper>
          <ResultDetailsGrid>
            <h4>First Name</h4>
            <span>{entity.get(PERSON_FIRST_NAME_FQN, []).join(' | ')}</span>
            <h4>Last Name</h4>
            <span>{entity.get(PERSON_LAST_NAME_FQN, []).join(' | ')}</span>
            <h4>Date of Birth</h4>
            <span>{entity.get(PERSON_BIRTH_DATE_FQN, []).join(' | ')}</span>
            <h4>Sex</h4>
            <span>{entity.get(PERSON_SEX_FQN, []).join(' | ')}</span>
            <h4>Race</h4>
            <span>{entity.get(PERSON_RACE_FQN, []).join(' | ')}</span>
            <h4>Ethnicity</h4>
            <span>{entity.get(PERSON_ETHNICITY_FQN, []).join(' | ')}</span>
          </ResultDetailsGrid>
        </CardSegment>
        {
          showSources && (
            <CardSegment vertical>
              <ResultDetailsGrid>
                <h4>Entity Set</h4>
                <span>{entitySetTitle}</span>
                <h4>Data Source</h4>
                <span>{entity.get(OL_DATA_SOURCE_FQN, [])}</span>
              </ResultDetailsGrid>
            </CardSegment>
          )
        }
      </Card>
    );
  }
}

export default EntityLinkingCard;
