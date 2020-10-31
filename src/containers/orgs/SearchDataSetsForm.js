/*
 * @flow
 */

import React, { useState } from 'react';

import _isFunction from 'lodash/isFunction';
import { SearchInput } from 'lattice-ui-kit';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { ActionsGrid, SearchButton } from '../../components';

const SearchDataSetsForm = ({
  onSubmit,
  searchRequestState,
} :{|
  onSubmit :(query :string) => void;
  searchRequestState :?RequestState;
|}) => {

  const [query, setQuery] = useState('');

  const handleOnChange = (event :SyntheticInputEvent<HTMLInputElement>) => {
    setQuery(event.target.value || '');
  };

  const handleOnSubmit = (event :SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (_isFunction(onSubmit)) {
      onSubmit(query);
    }
  };

  return (
    <form onSubmit={handleOnSubmit}>
      <ActionsGrid>
        <SearchInput onChange={handleOnChange} placeholder="" />
        <SearchButton
            aria-label="search data sets button"
            color="primary"
            isPending={searchRequestState === RequestStates.PENDING}
            type="submit" />
      </ActionsGrid>
    </form>
  );
};

export default SearchDataSetsForm;
