/*
 * @flow
 */

import React, { useMemo, useState } from 'react';

import styled from 'styled-components';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/pro-light-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Map, Set } from 'immutable';
import { Models } from 'lattice';
import { CardStack, IconButton, Spinner } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { RequestStates } from 'redux-reqseq';
import type { UUID } from 'lattice';
import type { RequestState } from 'redux-reqseq';

import EntityNeighborsCardContainer from './EntityNeighborsCardContainer';

import { Header } from '../../components';
import { EDMUtils } from '../../core/edm';
import { REDUCERS } from '../../core/redux/constants';
import { ExploreActions } from '../explore';

const { EntitySet } = Models;

const { EXPLORE } = REDUCERS;
const { EXPLORE_ENTITY_NEIGHBORS } = ExploreActions;
const { useEntitySets } = EDMUtils;

const ContainerWrapper = styled.div`
  min-height: 500px;
`;

const AssociationSection = styled.section`
  padding-bottom: 30px;

  &:last-child {
    padding-bottom: 0;
  }
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const ChevronDownIcon = (
  <FontAwesomeIcon fixedWidth icon={faChevronCircleDown} size="2x" />
);

const ChevronUpIcon = (
  <FontAwesomeIcon fixedWidth icon={faChevronCircleUp} size="2x" />
);

const ChevronButton = styled(IconButton).attrs(({ isOpen }) => ({
  icon: isOpen ? ChevronUpIcon : ChevronDownIcon,
}))`
  padding: 4px;
`;

type Props = {
  neighbors :Map;
};

const EntityNeighborsContainer = ({ neighbors } :Props) => {

  const [visibleSections, setVisibleSections] = useState(Map());
  const exploreEntityNeighborsRS :?RequestState = useRequestState([EXPLORE, EXPLORE_ENTITY_NEIGHBORS]);

  const associationEntitySetIds :Set<UUID> = useMemo(() => (
    neighbors ? neighbors.keySeq().toSet() : Set()
  ), [neighbors]);

  const entitySetIds :Set<UUID> = useMemo(() => (
    Set().withMutations((set) => {
      if (neighbors) {
        neighbors.reduce((ids :Set<UUID>, esNeighborsMap :Map) => ids.add(esNeighborsMap.keySeq()), set);
      }
    }).flatten()
  ), [neighbors]);

  const entitySetsMap = useEntitySets(entitySetIds);
  const associationEntitySetsMap = useEntitySets(associationEntitySetIds);

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
    <ContainerWrapper>
      {
        (Object.values(associationEntitySetsMap) :any).map((associationEntitySet :EntitySet) => (
          <AssociationSection key={associationEntitySet.id}>
            <SectionHeader>
              <Header as="h2">{associationEntitySet.title}</Header>
              <ChevronButton
                  isOpen={visibleSections.get(associationEntitySet.id)}
                  data-entity-set-id={associationEntitySet.id}
                  onClick={handleOnClick} />
            </SectionHeader>
            {
              visibleSections.get(associationEntitySet.id) && (
                <>
                  <br />
                  <CardStack>
                    {
                      neighbors
                        .get(associationEntitySet.id)
                        .map((entitySetNeighbors, entitySetId :UUID) => {
                          const entitySet :?EntitySet = entitySetsMap[entitySetId];
                          if (entitySet) {
                            return (
                              <EntityNeighborsCardContainer
                                  key={entitySet.id}
                                  entitySet={entitySet}
                                  neighbors={entitySetNeighbors} />
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
    </ContainerWrapper>
  );
};

export default EntityNeighborsContainer;
