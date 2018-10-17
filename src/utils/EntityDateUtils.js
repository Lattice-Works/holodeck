import moment from 'moment';
import { List } from 'immutable';

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
  ]
};

export const getDateProperties = (entityType) => {
  const fqn = getFqnString(entityType.get('type'));
  return dateProperties[fqn] || [];
};

export const getEntityDates = (entityType, entity, skipConversion) => {
  const dates = [];

  getDateProperties(entityType).forEach((dateFqn) => {
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

export const getEntityDateStrings = (entityType, entity) => getEntityDates(entityType, entity, true);
