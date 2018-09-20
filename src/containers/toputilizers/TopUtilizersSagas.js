/*
 * @flow
 */

import moment from 'moment';
import {
  Constants,
  AnalysisApi,
  DataApi,
  SearchApi
} from 'lattice';
import {
  fromJS,
  List,
  Map,
  Set
} from 'immutable';
import { call, put, takeEvery } from 'redux-saga/effects';

import {
  GET_NEIGHBOR_TYPES,
  GET_TOP_UTILIZERS,
  LOAD_TOP_UTILIZER_NEIGHBORS,
  getNeighborTypes,
  getTopUtilizers,
  loadTopUtilizerNeighbors
} from './TopUtilizersActionFactory';
import { COUNT_TYPES, TOP_UTILIZERS_FILTER } from '../../utils/constants/TopUtilizerConstants';
import { COUNT_FQN } from '../../utils/constants/DataConstants';
import { getEntityKeyId } from '../../utils/DataUtils';
import { toISODate } from '../../utils/FormattingUtils';

const { OPENLATTICE_ID_FQN } = Constants;

const getDateFiltersFromMap = (id, dateMap) => {
  let result = Map();
  dateMap.get(id, Map()).entrySeq().forEach(([propertyTypeId, ranges]) => {
    ranges.forEach((range) => {
      const start = range[0];
      const end = range[1];
      let rangeDescriptor = {};
      if (start) {
        rangeDescriptor = Object.assign({}, rangeDescriptor, {
          '@class': 'com.openlattice.analysis.requests.DateRangeFilter',
          lowerbound: start,
          gte: true
        });
      }
      if (end) {
        rangeDescriptor = Object.assign({}, rangeDescriptor, {
          '@class': 'com.openlattice.analysis.requests.DateRangeFilter',
          upperbound: end,
          lte: true
        });
      }
      result = result.set(propertyTypeId, result.get(propertyTypeId, List()).push(rangeDescriptor));
    });
  });

  return result;
};

const getCountBreakdown = (query, topUtilizers) => {
  let breakdown = Map();
  topUtilizers.forEach((utilizer) => {
    const id = utilizer[OPENLATTICE_ID_FQN][0];

    let utilizerBreakdown = Map().set('score', utilizer[COUNT_FQN][0]);

    query.forEach((pairDetails, index) => {
      const {
        associationTypeId,
        neighborTypeId,
        associationAggregations,
        entitySetAggregations
      } = pairDetails;
      const pair = List.of(associationTypeId, neighborTypeId);

      let pairMap = Map().set(COUNT_FQN, utilizer[`assoc_${index}_count`]);

      Object.keys(associationAggregations).forEach((propertyTypeId) => {
        pairMap = pairMap.set(propertyTypeId, utilizer[`assoc_${index}_${propertyTypeId}`]);
      });

      Object.keys(entitySetAggregations).forEach((propertyTypeId) => {
        pairMap = pairMap.set(propertyTypeId, utilizer[`entity_${index}_${propertyTypeId}`]);
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
      entityTypesById
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

          entityTypesById.getIn([entityTypeId, 'properties'], List()).forEach((id) => {
            if (propertyTypeWeights.has(id)) {
              const weight = propertyTypeWeights.get(id) * selectedType[TOP_UTILIZERS_FILTER.WEIGHT];
              if (weight !== 0) {
                agg = Object.assign({}, agg, {
                  [id]: {
                    weight,
                    aggregationType: 'SUM'
                  }
                });
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
        descriptor = Object.assign({}, descriptor, { associationFilters: assocRangeFilters.toJS() });
      }

      const neighborRangeFilters = getDateFiltersFromMap(neighborId, dateFiltersAsMap);
      if (neighborRangeFilters.size) {
        descriptor = Object.assign({}, descriptor, { neighborFilters: neighborRangeFilters.toJS() });
      }

      return descriptor;
    });

    const query = {
      neighborAggregations: formattedFilters,
      selfAggregations: []
    };

    let topUtilizers = yield call(AnalysisApi.getTopUtilizers, entitySetId, numResults, query);

    // TODO delete when we have data in response v
    const ID_KEY = 'self_entity_key_id';

    const utilizerData = yield call(DataApi.getEntitySetData, entitySetId, [], topUtilizers.map(u => u[ID_KEY]));

    const entitiesAsMap = {};
    utilizerData.forEach((utilizer) => {
      entitiesAsMap[utilizer[OPENLATTICE_ID_FQN][0]] = utilizer;
    });

    topUtilizers = topUtilizers.map(utilizer => Object.assign(
      {},
      utilizer,
      entitiesAsMap[utilizer[ID_KEY]],
      { [COUNT_FQN]: [utilizer.score] }
    ));
    // TODO delete when we have data in response ^

    const scoresByUtilizer = getCountBreakdown(formattedFilters, topUtilizers);

    yield put(getTopUtilizers.success(action.id, { topUtilizers, scoresByUtilizer }));

    yield put(loadTopUtilizerNeighbors({
      entitySetId,
      topUtilizers,
      eventFilters,
      dateFiltersAsMap
    }));
  }
  catch (error) {
    console.error(error);
    yield put(getTopUtilizers.failure(action.id, error));
  }
  finally {
    yield put(getTopUtilizers.finally(action.id));
  }
}

export function* getTopUtilizersWatcher() {
  yield takeEvery(GET_TOP_UTILIZERS, getTopUtilizersWorker);
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

const rangeMatches = (entity, typeId, filtersMap) => {
  if (!filtersMap.has(typeId)) {
    return true;
  }
  filtersMap.get(typeId).entrySeq().forEach(([propertyTypeId, ranges]) => {
    if (!entity[propertyTypeId]) {
      return false;
    }
    let anyMatch = false;

    // convert entity values to moments
    const momentValues = entity[propertyTypeId].map(dateStr => moment(dateStr)).filter(m => m.isValid());

    // check whether any dates fall within any specified ranges
    ranges.forEach((range) => {
      let filteredDates = range[0] ? momentValues.filter(date => date.isSameOrAfter(range[0])) : momentValues;
      if (range[1]) {
        filteredDates = filteredDates.filter(date => date.isSameOrBefore([range[1]]));
      }
      if (filteredDates.length) {
        anyMatch = true;
      }

    });
    if (!anyMatch) {
      return false;
    }
  });

  return true;
};

function* loadTopUtilizerNeighborsWorker(action :SequenceAction) :Generator<*, *, *> {
  try {
    yield put(loadTopUtilizerNeighbors.request(action.id));
    const {
      entitySetId,
      eventFilters,
      dateFiltersAsMap,
      topUtilizers
    } = action.value;

    // convert date filters from date strings to moments
    let dateFilters = Map();
    dateFiltersAsMap.entrySeq().forEach(([entityTypeId, filters]) => {
      filters.entrySeq().forEach(([propertyTypeId, rangeList]) => {
        dateFilters = dateFilters.setIn([entityTypeId, propertyTypeId], List());
        rangeList.forEach((range) => {
          const start = range[0] ? moment(range[0]) : null;
          const end = range[1] ? moment(range[1]) : null;
          dateFilters = dateFilters.setIn([entityTypeId, propertyTypeId], [start, end]);
        });
      });
    });

    let initFilterMap = Map();

    eventFilters.forEach((filter) => {
      const pair = List.of(filter[TOP_UTILIZERS_FILTER.ASSOC_ID], filter[TOP_UTILIZERS_FILTER.NEIGHBOR_ID]);
      initFilterMap = initFilterMap.set(pair, 0);
    });

    const ids = fromJS(topUtilizers).map(getEntityKeyId);

    const neighborsById = yield call(SearchApi.searchEntityNeighborsBulk, entitySetId, ids.toJS());

    let neighborCounts = Map();

    Object.keys(neighborsById).forEach((entityKeyId) => {
      const neighborList = neighborsById[entityKeyId];
      let counts = initFilterMap;

      neighborList.forEach((neighbor) => {
        const {
          associationDetails,
          associationEntitySet,
          neighborDetails,
          neighborEntitySet
        } = neighbor;
        if (associationEntitySet && neighborEntitySet) {
          const assocId = associationEntitySet.entityTypeId;
          const neighborId = neighborEntitySet.entityTypeId;

          if (assocId && neighborId) {
            const pair = List.of(assocId, neighborId);

            if (counts.has(pair)
              && rangeMatches(associationDetails, assocId, dateFilters)
              && rangeMatches(neighborDetails, neighborId, dateFilters)) {
              counts = counts.set(pair, counts.get(pair) + 1);
            }
          }
        }
      });
      neighborCounts = neighborCounts.set(entityKeyId, counts);
    });

    yield put(loadTopUtilizerNeighbors.success(action.id, { neighborCounts, neighborsById }));
  }
  catch (error) {
    console.error(error)
    yield put(loadTopUtilizerNeighbors.failure(action.id, error));
  }
  finally {
    yield put(loadTopUtilizerNeighbors.finally(action.id));
  }
}

export function* loadTopUtilizerNeighborsWatcher() :Generator<*, *, *> {
  yield takeEvery(LOAD_TOP_UTILIZER_NEIGHBORS, loadTopUtilizerNeighborsWorker);
}
