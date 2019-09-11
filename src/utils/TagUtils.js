import moment from 'moment';
import { List, Map } from 'immutable';

import { PROPERTY_TAGS } from './constants/DataModelConstants';
import { getFqnString } from './DataUtils';

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

export const getTagsByFqn = (entityType, propertyTypesById) => {
  let tagsbyFqn = Map();

  entityType.get('propertyTags').entrySeq().forEach(([propertyTypeId, tags]) => {
    tagsbyFqn = tagsbyFqn.set(getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'])), tags);
  });

  return tagsbyFqn;
};

export const getTagPropertyFqns = (entityType, propertyTypesById, tag) => getTagsByFqn(entityType, propertyTypesById)
  .entrySeq()
  .filter(([fqn, tags]) => tags.includes(tag))
  .map(([fqn]) => fqn);

export const getEntityEventDates = (
  entityType,
  propertyTypesById,
  entity,
  skipConversion
) => getDatesForList(
  getTagPropertyFqns(entityType, propertyTypesById, PROPERTY_TAGS.EVENT_DATE),
  entity,
  skipConversion
);

export const getPieChartPropertyFqns = (entityType, propertyTypesById) => getTagPropertyFqns(
  entityType,
  propertyTypesById,
  PROPERTY_TAGS.PIE
);

export const getEntityTitle = (entityType, propertyTypesById, entity) => {
  const titleFqns = getTagPropertyFqns(entityType, propertyTypesById, PROPERTY_TAGS.TITLE);

  const titleValue = titleFqns.map((fqn) => entity.getIn([fqn, 0])).filter((val) => !!val).join(', ');
  return titleValue.length ? titleValue : `[${entityType.get('title')}]`;
};
