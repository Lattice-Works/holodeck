/*
 * @flow
 */

import Papa from 'papaparse';
import moment from 'moment';
import {
  call,
  put,
  select,
  takeEvery
} from '@redux-saga/core/effects';
import {
  fromJS,
  List,
  Map,
} from 'immutable';
import {
  Constants,
  AnalysisApi,
  DataApi,
  SearchApi
} from 'lattice';
import type { SequenceAction } from 'redux-reqseq';

import FileSaver from '../../utils/FileSaver';
import Logger from '../../utils/Logger';
import {
  DOWNLOAD_TOP_UTILIZERS,
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  LOAD_TOP_UTILIZER_NEIGHBORS,
  downloadTopUtilizers,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors
} from './TopUtilizersActionFactory';
import { COUNT_TYPES, TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { COUNT_FQN, DATE_FILTER_CLASS } from '../../utils/constants/DataConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import { toISODate } from '../../utils/FormattingUtils';

const LOG = new Logger('TopUtilizersSagas');

const { OPENLATTICE_ID_FQN } = Constants;

const getDateFiltersFromMap = (id, dateMap) => {
  let result = Map();
  dateMap.get(id, Map()).entrySeq().forEach(([propertyTypeId, ranges]) => {
    ranges.forEach((range) => {
      const start = range[0];
      const end = range[1];
      let rangeDescriptor = {};
      if (start) {
        rangeDescriptor = {
          ...rangeDescriptor,
          '@class': DATE_FILTER_CLASS,
          lowerbound: start,
          gte: true,
        };
      }
      if (end) {
        rangeDescriptor = {
          ...rangeDescriptor,
          '@class': DATE_FILTER_CLASS,
          upperbound: end,
          lte: true,
        };
      }
      result = result.set(propertyTypeId, result.get(propertyTypeId, List()).push(rangeDescriptor));
    });
  });

  return result;
};

const getCountBreakdown = (query, topUtilizers) => {
  let breakdown = Map();
  topUtilizers.forEach((utilizer) => {

    const { results } = utilizer;

    const id = utilizer[OPENLATTICE_ID_FQN][0];

    let utilizerBreakdown = Map().set('score', utilizer[COUNT_FQN][0]);

    results.forEach((aggResult) => {
      const {
        associationTypeId,
        neighborTypeId,
        associationsEntityAggregationResult,
        neighborsEntityAggregationResult,
        score
      } = aggResult;

      const pair = List.of(associationTypeId, neighborTypeId);

      let pairMap = Map().set(COUNT_FQN, score);

      Object.entries(associationsEntityAggregationResult.scorable).forEach(([propertyTypeId, ptScore]) => {
        pairMap = pairMap.set(propertyTypeId, ptScore);
      });

      Object.entries(neighborsEntityAggregationResult.scorable).forEach(([propertyTypeId, ptScore]) => {
        pairMap = pairMap.set(propertyTypeId, ptScore);
      });

      utilizerBreakdown = utilizerBreakdown.set(pair, pairMap);
    });

    breakdown = breakdown.set(id, utilizerBreakdown);
  });

  return breakdown;
};

function* getTopUtilizersWorker(action :SequenceAction) {
  try {
    const {
      entitySetId,
      numResults,
      eventFilters,
      dateFilters,
      countType,
      durationTypeWeights,
      entityTypes,
      entityTypesIndexMap,
      filteredPropertyTypes
    } = action.value;

    yield put(getTopUtilizers.request(action.id, { eventFilters, dateFilters }));
    let dateFiltersAsMap = Map();
    dateFilters.forEach((dateFilter) => {
      const { start, end, properties } = dateFilter;
      if (start.length || end.length) {
        const startMoment = moment(start);
        const endMoment = moment(end);
        const isoStart = startMoment.isValid() ? toISODate(startMoment) : null;
        const isoEnd = endMoment.isValid() ? toISODate(endMoment) : null;
        properties.forEach((pair) => {
          dateFiltersAsMap = dateFiltersAsMap.setIn(
            [pair.get(0), pair.get(1)],
            dateFiltersAsMap.getIn([pair.get(0), pair.get(1)], List()).push([isoStart, isoEnd])
          );
        });
      }
    });

    const formattedFilters = eventFilters.map((selectedType) => {
      const assocId = selectedType[TOP_UTILIZERS_FILTER.ASSOC_ID];
      const neighborId = selectedType[TOP_UTILIZERS_FILTER.NEIGHBOR_ID];
      const countWeight = countType === COUNT_TYPES.EVENTS ? selectedType[TOP_UTILIZERS_FILTER.WEIGHT] : 0;

      const getAgg = (entityTypeId) => {
        let agg = {};

        if (countType === COUNT_TYPES.DURATION) {
          const pair = List.of(assocId, neighborId);
          const propertyTypeWeights = durationTypeWeights.get(pair, Map());

          const entityTypeIndex = entityTypesIndexMap.get(entityTypeId);
          const entityType = entityTypes.get(entityTypeIndex, Map());
          entityType.get('properties', List()).forEach((id) => {
            if (propertyTypeWeights.has(id)) {
              const weight = propertyTypeWeights.get(id) * selectedType[TOP_UTILIZERS_FILTER.WEIGHT];
              if (weight !== 0) {
                agg = {
                  ...agg,
                  [id]: {
                    weight,
                    aggregationType: 'SUM'
                  },
                };
              }
            }
          });
        }
        return agg;
      };

      let descriptor = {
        associationTypeId: assocId,
        neighborTypeId: neighborId,
        isDst: selectedType[TOP_UTILIZERS_FILTER.IS_SRC],
        entitySetAggregations: getAgg(neighborId),
        associationAggregations: getAgg(assocId),
        weight: countWeight
      };

      const assocRangeFilters = getDateFiltersFromMap(assocId, dateFiltersAsMap);
      if (assocRangeFilters.size) {
        descriptor = { ...descriptor, associationFilters: assocRangeFilters.toJS() };
      }

      const neighborRangeFilters = getDateFiltersFromMap(neighborId, dateFiltersAsMap);
      if (neighborRangeFilters.size) {
        descriptor = { ...descriptor, neighborFilters: neighborRangeFilters.toJS() };
      }

      return descriptor;
    });

    const query = {
      neighborAggregations: formattedFilters
    };

    const {
      associations,
      edges,
      entities,
      neighbors,
      rankings
    } = yield call(AnalysisApi.getTopUtilizers, entitySetId, numResults, query);

    // TODO delete when we have data in response v
    const ID_KEY = 'self_entity_key_id';

    const topUtilizers = [];

    rankings.forEach(({ entityKeyId, score, results }) => {
      const utilizerData = {
        [ID_KEY]: entityKeyId,
        [OPENLATTICE_ID_FQN]: [entityKeyId],
        [COUNT_FQN]: [score],
        ...entities[entityKeyId],
        results
      };

      topUtilizers.push(utilizerData);
    });

    const scoresByUtilizer = getCountBreakdown(formattedFilters, topUtilizers);

    yield put(getTopUtilizers.success(action.id, {
      topUtilizers,
      scoresByUtilizer,
      filteredPropertyTypes,
      query
    }));
    yield put(loadTopUtilizerNeighbors({ entitySetId, topUtilizers }));
  }
  catch (error) {
    LOG.error('getTopUtilizersWorker()', error);
    yield put(getTopUtilizers.failure(action.id, error));
  }
  finally {
    yield put(getTopUtilizers.finally(action.id));
  }
}

export function* getTopUtilizersWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_TOP_UTILIZERS, getTopUtilizersWorker);
}

function* downloadTopUtilizersWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(downloadTopUtilizers.request(action.id));

    const { name, fields, results } = action.value;

    const csv = Papa.unparse({
      fields: fields.toJS(),
      data: results.toJS()
    });

    FileSaver.saveFile(csv, name, 'csv');

    // TODO
    yield put(downloadTopUtilizers.success(action.id));
  }
  catch (error) {
    LOG.error('downloadTopUtilizersWorker()', error);
    yield put(downloadTopUtilizers.failure(action.id, error));
  }
  finally {
    yield put(downloadTopUtilizers.finally(action.id));
  }
}

export function* downloadTopUtilizersWatcher() :Generator<*, *, *> {
  yield takeEvery(DOWNLOAD_TOP_UTILIZERS, downloadTopUtilizersWorker);
}

function* getNeighborTypesWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(getNeighborTypes.request(action.id, action.value));
    const results = yield call(AnalysisApi.getNeighborTypes, action.value);
    yield put(getNeighborTypes.success(action.id, results));
  }
  catch (error) {
    yield put(getNeighborTypes.failure(action.id, error));
  }
  finally {
    yield put(getNeighborTypes.finally(action.id));
  }
}

export function* getNeighborTypesWatcher() :Generator<*, *, *> {
  yield takeEvery(GET_NEIGHBOR_TYPES, getNeighborTypesWorker);
}

function* loadTopUtilizerNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadTopUtilizerNeighbors.request(action.id));
    const { entitySetId, topUtilizers } = action.value;

    const ids = fromJS(topUtilizers).map(getEntityKeyId);
    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, ids.toJS());

    yield put(loadTopUtilizerNeighbors.success(action.id, { neighborsById }));
  }
  catch (error) {
    LOG.error(action.type, error);
    yield put(loadTopUtilizerNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadTopUtilizerNeighbors.finally(action.id));
  }
}

export function* loadTopUtilizerNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_TOP_UTILIZER_NEIGHBORS, loadTopUtilizerNeighborsWorker);
}
