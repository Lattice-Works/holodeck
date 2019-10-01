import moment from 'moment';
import { List, Map } from 'immutable';
import { Models } from 'lattice';

import { PROPERTY_TAGS } from './constants/DataModelConstants';

const { FullyQualifiedName } = Models;

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

export const getTagsByFqn = (entityType, propertyTypes, propertyTypesIndexMap) => {
  let tagsbyFqn = Map();
  entityType.get('propertyTags').entrySeq().forEach(([propertyTypeId, tags]) => {
    const propertyTypeIndex = propertyTypesIndexMap.get(propertyTypeId);
    const propertyType = propertyTypes.get(propertyTypeIndex, Map());
    const propertyTypeFQN = FullyQualifiedName.toString(propertyType.get('type', Map()));
    tagsbyFqn = tagsbyFqn.set(propertyTypeFQN, tags);
  });
  return tagsbyFqn;
};

export const getTagPropertyFqns = (
  entityType,
  propertyTypes,
  propertyTypesIndexMap,
  tag,
) => (
  getTagsByFqn(entityType, propertyTypes, propertyTypesIndexMap)
    .entrySeq()
    .filter(([fqn, tags]) => tags.includes(tag))
    .map(([fqn]) => fqn)
);

export const getEntityEventDates = (
  entityType,
  propertyTypes,
  propertyTypesIndexMap,
  entity,
  skipConversion
) => getDatesForList(
  getTagPropertyFqns(entityType, propertyTypes, propertyTypesIndexMap, PROPERTY_TAGS.EVENT_DATE),
  entity,
  skipConversion
);

export const getPieChartPropertyFqns = (entityType, propertyTypes, propertyTypesIndexMap) => getTagPropertyFqns(
  entityType,
  propertyTypes,
  propertyTypesIndexMap,
  PROPERTY_TAGS.PIE,
);

export const getEntityTitle = (
  entityType,
  propertyTypes,
  propertyTypesIndexMap,
  entity,
) => {

  const titleFqns = getTagPropertyFqns(entityType, propertyTypes, propertyTypesIndexMap, PROPERTY_TAGS.TITLE);

  const titleValue = titleFqns.map((fqn) => entity.getIn([fqn, 0])).filter((val) => !!val).join(', ');
  return titleValue.length ? titleValue : `[${entityType.get('title')}]`;
};
