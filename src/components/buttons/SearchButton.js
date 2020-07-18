/*
 * @flow
 */

import React from 'react';

import { faSearch } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Spinner } from 'lattice-ui-kit';

type Props = {
  isPending ?:boolean;
  onClick :(event :SyntheticEvent<HTMLButtonElement>) => void;
};

// 2020-07-17 NOTE: using "disabled" prop instead of "isLoading" because of a margin bug in LUK
const SearchButton = ({ isPending, onClick } :Props) => (
  <Button color="primary" disabled={isPending} onClick={onClick} type="submit">
    {
      isPending && <Spinner />
    }
    {
      !isPending && <FontAwesomeIcon fixedWidth icon={faSearch} />
    }
  </Button>
);

SearchButton.defaultProps = {
  isPending: false,
};

export default SearchButton;
