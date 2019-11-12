import moment from 'moment';
import {
  List,
  Map,
  Set,
  fromJS
} from 'immutable';
import { Models } from 'lattice';

import { PROPERTY_TAGS } from './constants/DataModelConstants';
import { DATE_FILTER_CLASS } from './constants/DataConstants';

const { FullyQualifiedName } = Models;

const dateProperties = {
  'general.person': [
    'nc.personBirthDate'
  ],
  'general.calculatedfor': [
    'psa.GeneratedDate'
  ],
  'justice.charge': [
    'justice.dispositiondate'
  ],
  'j.sentence': [
    'justice.incarcerationstartdate'
  ],
  'publicsafety.pretrialstatuscaseprocessings': [
    'publicsafety.ArrestDate',
    'ol.arrestdatetime',
    'publicsafety.FileDate'
  ],
  'general.registeredfor': [
    'date.completeddatetime'
  ],
  'justice.booking': [
    'publicsafety.ReleaseDate',
    'justice.ReferralDate'
  ],
  'justice.JailBooking': [
    'publicsafety.datebooked',
    'ol.datetime_release'
  ],
  'publicsafety.callforservice': [
    'datetime.arrived'
  ],
  'criminaljustice.incident': [
    'incident.reporteddatetime'
  ],
  'criminaljustice.arrestedin': [
    'ol.arrestdate'
  ],
  'housing.stay': [
    'date.admission'
  ],
  'ol.booking': [
    'general.datetime'
  ],
  'ol.jailstaylength': [
    'incident.startdatetime'
  ]
};

const NEIGHBOR = 'neighborDetails';
const ASSOCIATION = 'associationDetails';

export const getDateProperties = (entityType) => {
  const fqn = FullyQualifiedName.toString(entityType.get('type'));
  return dateProperties[fqn] || [];
};

const getDatesForList = (fqns, entity, skipConversion) => {
  const dates = [];

  fqns.forEach((dateFqn) => {
    entity.get(dateFqn, List()).forEach((dateStr) => {
      if (skipConversion) {
        dates.push(dateStr);
      }
      else {
        const date = moment(dateStr);
        if (date.isValid()) {
          dates.push(date);
        }
      }
    });
  });

  return dates;
};

export const getEntityDates = (entityType, entity, skipConversion) => getDatesForList(
  getDateProperties(entityType),
  entity,
  skipConversion
);

const getTagsByFqn = (entityType, propertyTypes, propertyTypesIndexMap) => {
  let tagsbyFqn = Map();
  entityType.get('propertyTags').entrySeq().forEach(([propertyTypeId, tags]) => {
    const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
    const propertyType = propertyTypes.get(propertyTypeIndex, Map());
    const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
    tagsbyFqn = tagsbyFqn.set(propertyTypeFQN, tags);
  });
  return tagsbyFqn;
};

export const getEntityEventDates = (
  entityType,
  propertyTypes,
  propertyTypesIndexMap,
  entity,
  skipConversion
) => getDatesForList(
  getTagsByFqn(entityType, propertyTypes, propertyTypesIndexMap)
    .entrySeq()
    .filter(([fqn, tags]) => tags.includes(PROPERTY_TAGS.EVENT_DATE))
    .map(([fqn]) => fqn),
  entity,
  skipConversion
);

export const getEntityDateStrings = (entityType, entity) => getEntityDates(entityType, entity, true);

export const getDateFilters = (query, propertyTypes, propertyTypesIndexMap) => {
  const { neighborAggregations } = query;

  let filters = Map();

  neighborAggregations.forEach((aggregation) => {
    const {
      associationTypeId,
      associationFilters,
      neighborTypeId,
      neighborFilters
    } = aggregation;

    const pair = List.of(associationTypeId, neighborTypeId);

    const updateDateFilters = (filterList, field) => {
      if (filterList) {
        Object.entries(filterList).forEach(([id, ptFilters]) => {
          const propertyTypeIndex = propertyTypesIndexMap.get(id);
          const propertyType = propertyTypes.get(propertyTypeIndex, Map());
          const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
          const dateFilters = fromJS(ptFilters.filter((filter) => filter['@class'] === DATE_FILTER_CLASS));
          if (dateFilters.size) {
            filters = filters.setIn([pair, field, propertyTypeFQN], dateFilters);
          }
        });
      }
    };

    updateDateFilters(associationFilters, ASSOCIATION);
    updateDateFilters(neighborFilters, NEIGHBOR);
  });

  return filters;
};

export const getPairFilters = (query) => {
  const { neighborAggregations } = query;

  let filters = Set();

  neighborAggregations.forEach((aggregation) => {
    const { associationTypeId, neighborTypeId } = aggregation;

    filters = filters.add(List.of(associationTypeId, neighborTypeId));
  });

  return filters;
};

export const checkDateFilterMatch = (filterMap, entity) => {
  let matches = true;

  if (filterMap) {
    filterMap.entrySeq().forEach(([fqn, filters]) => {
      let fqnMatch = false;
      const dates = entity.get(fqn, List());

      filters.forEach((filter) => {
        let filterMatch = false;
        const lowerbound = filter.get('lowerbound') ? moment(filter.get('lowerbound')) : null;
        const upperbound = filter.get('upperbound') ? moment(filter.get('upperbound')) : null;

        dates.forEach((date) => {
          let dateMatch = true;

          if (lowerbound && lowerbound.isAfter(date)) dateMatch = false;
          if (upperbound && upperbound.isBefore(date)) dateMatch = false;

          if (dateMatch) {
            filterMatch = true;
          }
        });

        if (filterMatch) {
          fqnMatch = true;
        }
      });

      if (!fqnMatch) {
        matches = false;
      }
    });
  }

  return matches;
};

export const matchesFilters = (pair, dateFilters, association, neighbor) => {
  const filters = dateFilters.get(pair);

  if (filters) {
    const associationFiltersMatch = checkDateFilterMatch(filters.get(ASSOCIATION), association);
    const neighborFiltersMatch = checkDateFilterMatch(filters.get(NEIGHBOR), neighbor);

    return associationFiltersMatch && neighborFiltersMatch;
  }

  return true;
};
