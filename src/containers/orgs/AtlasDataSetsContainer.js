/*
 * @flow
 */

import React, { useEffect } from 'react';

import { List, Map, getIn } from 'immutable';
import { DataSetsApiActions } from 'lattice-sagas';
import { AppContentWrapper, CardStack, Spinner } from 'lattice-ui-kit';
import { useRequestState } from 'lattice-utils';
import { useDispatch, useSelector } from 'react-redux';
import { RequestStates } from 'redux-reqseq';
import type { RequestState } from 'redux-reqseq';

import { BasicErrorComponent, SimpleAtlasDataSetCard } from '../../components';
import { ReduxActions } from '../../core/redux';
import { REDUCERS } from '../../core/redux/constants';

const { GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS, getOrganizationDataSetsWithColumns } = DataSetsApiActions;

const { resetRequestState } = ReduxActions;
const { ORGS } = REDUCERS;

type Props = {
  organizationId :UUID;
};

const AtlasDataSetsContainer = ({ organizationId } :Props) => {

  const getAtlasDataSetsRS :?RequestState = useRequestState([ORGS, GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS]);
  const atlasDataSets :List = useSelector((s) => s.getIn([ORGS, 'atlasDataSets', organizationId], List()));

  const dispatch = useDispatch();
  useEffect(() => {
    if (!atlasDataSets || atlasDataSets.isEmpty()) {
      dispatch(getOrganizationDataSetsWithColumns(organizationId));
    }
  }, [atlasDataSets, dispatch, organizationId]);

  useEffect(() => () => (
    dispatch(resetRequestState([GET_ORGANIZATION_DATA_SETS_WITH_COLUMNS]))
  ), []);

  return (
    <AppContentWrapper>
      {
        getAtlasDataSetsRS === RequestStates.FAILURE && (
          <BasicErrorComponent>
            Sorry, something went wrong. Please try again.
          </BasicErrorComponent>
        )
      }
      {
        getAtlasDataSetsRS === RequestStates.PENDING && (
          <Spinner size="2x" />
        )
      }
      {
        atlasDataSets && !atlasDataSets.isEmpty() && (
          <CardStack>
            {
              atlasDataSets.map((dataSet :Map) => (
                <SimpleAtlasDataSetCard
                    key={getIn(dataSet, ['table', 'id'])}
                    dataSet={dataSet}
                    organizationId={organizationId} />
              ))
            }
          </CardStack>
        )
      }
    </AppContentWrapper>
  );
};

export default AtlasDataSetsContainer;
