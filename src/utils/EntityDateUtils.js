import moment from 'moment';
import { List, Map } from 'immutable';

import { PROPERTY_TAGS } from './constants/DataModelConstants';
import { getFqnString } from './DataUtils';

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

export const getDateProperties = (entityType) => {
  const fqn = getFqnString(entityType.get('type'));
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

const getTagsByFqn = (entityType, propertyTypesById) => {
  let tagsbyFqn = Map();

  entityType.get('propertyTags').entrySeq().forEach(([propertyTypeId, tags]) => {
    tagsbyFqn = tagsbyFqn.set(getFqnString(propertyTypesById.getIn([propertyTypeId, 'type'])), tags);
  });

  return tagsbyFqn;
};

export const getEntityEventDates = (
  entityType,
  propertyTypesById,
  entity,
  skipConversion
) => getDatesForList(
  getTagsByFqn(entityType, propertyTypesById)
    .entrySeq()
    .filter(([fqn, tags]) => tags.includes(PROPERTY_TAGS.EVENT_DATE))
    .map(([fqn]) => fqn),
  entity,
  skipConversion
);

export const getEntityDateStrings = (entityType, entity) => getEntityDates(entityType, entity, true);
