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

const { GET_ORGANIZATION_DATA_SETS, getOrganizationDataSets } = DataSetsApiActions;

const { ORGS } = REDUCERS;
const { resetRequestState } = ReduxActions;

type Props = {
  organizationId :UUID;
};

const AtlasDataSetsContainer = ({ organizationId } :Props) => {

  const dispatch = useDispatch();

  // const matchAtlasDataSets :boolean = !!useRouteMatch({ exact: true, path: Routes.ATLAS_DATA_SETS });
  const getAtlasDataSetsRS :?RequestState = useRequestState([ORGS, GET_ORGANIZATION_DATA_SETS]);
  const atlasDataSets :List = useSelector((s) => s.getIn([ORGS, 'atlasDataSets', organizationId], List()));

  useEffect(() => {
    dispatch(getOrganizationDataSets({ organizationId }));
  }, [dispatch, organizationId]);

  useEffect(() => () => (
    dispatch(resetRequestState([GET_ORGANIZATION_DATA_SETS]))
  ), []);

  return (
    <AppContentWrapper>
      {
        getAtlasDataSetsRS === RequestStates.PENDING && (
          <Spinner size="2x" />
        )
      }
      {
        getAtlasDataSetsRS === RequestStates.FAILURE && (
          <BasicErrorComponent />
        )
      }
      {
        getAtlasDataSetsRS === RequestStates.SUCCESS && atlasDataSets && !atlasDataSets.isEmpty() && (
          <CardStack>
            {
              atlasDataSets.map((atlasDataSet :Map) => (
                <SimpleAtlasDataSetCard
                    atlasDataSet={atlasDataSet}
                    key={getIn(atlasDataSet, ['table', 'id'])}
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
