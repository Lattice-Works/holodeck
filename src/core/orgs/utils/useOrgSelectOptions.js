/*
 * @flow
 */

import { Map } from 'immutable';
import { Models } from 'lattice';
import { useSelector } from 'react-redux';

import { REDUCERS } from '../../redux/constants';

const { Organization } = Models;

// OPTIMIZE / MEMOIZE
const useOrgSelectOptions = () :SelectOption[] => (
  useSelector((state :Map) => {
    const organizations :Map = state.getIn([REDUCERS.ORGS, 'organizationsMap'], Map());
    const options = [];
    organizations.valueSeq().forEach((org :Organization) => {
      options.push({ label: org.title, value: (org.id :any) });
    });
    return options;
  })
);

export default useOrgSelectOptions;
