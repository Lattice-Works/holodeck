/*
 * @flow
 */

import React, { useState } from 'react';

import styled from 'styled-components';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, Set } from 'immutable';
import { Models } from 'lattice';
import {
  Card,
  CardSegment,
  CardStack,
  IconButton,
  Spinner,
} from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { Title } from '../../components';
import { REDUCERS } from '../../core/redux/constants';
import { ExploreActions } from '../explore';

const { EntitySet } = Models;

const { EDM, EXPLORE } = REDUCERS;
const { EXPLORE_ENTITY_NEIGHBORS } = ExploreActions;

const AssociationSection = styled.section`
  padding: 10px 0;
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ChevronDownIcon = (
  <FontAwesomeIcon icon={faChevronCircleDown} size="2x" />
);

const ChevronUpIcon = (
  <FontAwesomeIcon icon={faChevronCircleUp} size="2x" />
);

const ChevronButton = styled(IconButton).attrs(({ isOpen }) => ({
  icon: isOpen ? ChevronUpIcon : ChevronDownIcon,
}))`
  padding: 4px;
`;

type Props = {
  entityKeyId :UUID;
  neighbors :Map;
};

const EntityNeighborsContainer = ({ entityKeyId, neighbors } :Props) => {

  const [visibleSections, setVisibleSections] = useState(Map());
  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS]);

  let associationEntitySetIds = Set();
  let entitySetIds = Set();
  if (neighbors && !neighbors.isEmpty()) {
    associationEntitySetIds = neighbors.keySeq().toSet();
    entitySetIds = Set().withMutations((set) => {
      neighbors.reduce((ids, value) => ids.add(value.keySeq()), set);
    }).flatten();
  }

  // OPTIMIZE
  const associationEntitySets :EntitySet[] = useSelector((s) => {
    return associationEntitySetIds.map((id :UUID) => {
      return s.getIn([EDM, 'entitySets', s.getIn([EDM, 'entitySetsIndexMap', id])]);
    });
  });

  // OPTIMIZE
  const entitySetsMap :{ [UUID] :EntitySet } = useSelector((s) => {
    const map = {};
    entitySetIds.forEach((esid :UUID) => {
      map[esid] = s.getIn([EDM, 'entitySets', s.getIn([EDM, 'entitySetsIndexMap', esid])]);
    }, map);
    return map;
  });

  const handleOnClick = (event :SyntheticEvent<HTMLButtonElement>) => {
    const { currentTarget } = event;
    if (currentTarget instanceof HTMLElement) {
      const { dataset } = currentTarget;
      if (dataset.entitySetId) {
        const isVisible = visibleSections.get(dataset.entitySetId) || false;
        setVisibleSections(visibleSections.set(dataset.entitySetId, !isVisible));
      }
    }
  };

  if (exploreEntityNeighborsRS === RequestStates.PENDING) {
    return (
      <Spinner size="2x" />
    );
  }

  return (
    <div>
      {
        associationEntitySets.map((aes :EntitySet) => (
          <AssociationSection key={aes.id}>
            <SectionHeader>
              <Title as="h2">{aes.title}</Title>
              <ChevronButton isOpen={visibleSections.get(aes.id)} data-entity-set-id={aes.id} onClick={handleOnClick} />
            </SectionHeader>
            {
              visibleSections.get(aes.id) && (
                <>
                  <br />
                  <CardStack>
                    {
                      neighbors.get(aes.id)
                        .map((entities, entitySetId) => {
                          const entitySet :?EntitySet = entitySetsMap[entitySetId];
                          if (entitySet) {
                            return (
                              <Card key={entitySet.id}>
                                <CardSegment>
                                  <Title as="h3">{entitySet.title}</Title>
                                </CardSegment>
                              </Card>
                            );
                          }
                          return null;
                        })
                        .toList()
                    }
                  </CardStack>
                </>
              )
            }
          </AssociationSection>
        ))
      }
    </div>
  );

};

export default EntityNeighborsContainer;
