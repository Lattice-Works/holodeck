/*
 * @flow
 */

import React from 'react';

import styled from 'styled-components';
// import { Models } from 'lattice';
import {
  AppContentWrapper,
  Card,
  SearchButton,
  SearchInput,
} from 'lattice-ui-kit';
import { useInput } from 'lattice-utils';

import { CardSegmentNoBorder } from '../../../components';

// const { EntitySet } = Models;

const SearchGrid = styled.div`
  align-items: flex-start;
  display: grid;
  flex: 1;
  grid-auto-flow: column;
  grid-gap: 10px;
  grid-template-columns: 1fr auto;

  button {
    line-height: 1.5;
  }
`;

// type Props = {
//   entitySet :EntitySet;
// };

const EntitySetSearchContainer = () => {

  const [query, setQuery] = useInput('');

  return (
    <AppContentWrapper>
      <Card>
        <CardSegmentNoBorder vertical>
          <form>
            <SearchGrid>
              <SearchInput onChange={setQuery} value={query} />
              <SearchButton
                  mode="primary"
                  onClick={() => {}}
                  type="submit" />
            </SearchGrid>
          </form>
        </CardSegmentNoBorder>
      </Card>
    </AppContentWrapper>
  );
};

export default EntitySetSearchContainer;
