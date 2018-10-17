export const PERSON_ENTITY_TYPE_FQN = 'general.person';

export const PROPERTY_TYPES = {
  /* Person-specific property types */
  FIRST_NAME: 'nc.PersonGivenName',
  MIDDLE_NAME: 'nc.PersonMiddleName',
  LAST_NAME: 'nc.PersonSurName',
  SUFFIX: 'nc.PersonSuffix',
  NICKNAME: 'nc.PersonNickName',
  SSN: 'nc.SSN',
  DOB: 'nc.PersonBirthDate',
  RACE: 'nc.PersonRace',
  ETHNICITY: 'nc.PersonEthnicity',
  SEX: 'nc.PersonSex',
  GENDER: 'bhr.gender',
  MARITAL_STATUS: 'person.maritalstatus',
  MUGSHOT: 'publicsafety.mugshot',
  PICTURE: 'person.picture',

  ENTRY_UPDATED: 'general.entryupdated',

  DURATION_MINUTES: 'ol.durationinterval',
  POLICE_MINUTES: 'ol.policeminutes',
  POLICE_MINUTES_PER_PERSON: 'ol.personpoliceminutes',
  FIRE_DEPT_MINUTES: 'ol.firedeptminutes',
  FIRE_DEPT_MINUTES_PER_PERSON: 'ol.personfireminutes',
  EMS_MINUTES: 'ol.emsminutes',
  EMS_MINUTES_PER_PERSON: 'ol.personemsminutes',
  ORGANIZATION_TIME: 'ol.organizationtime',
  DURATION_HOURS: 'ol.durationhours',
  DURATION_DAYS: 'ol.durationdays',
  TIME_SERVED_DAYS: 'criminaljustice.timeserveddays',
  HOUSING_LENGTH_OF_STAY: 'housing.lengthofstay',

  DATETIME_ALERTED: 'datetime.alerted',
  DATE_BOOKED: 'publicsafety.datebooked',
  BOOKING_DATE: 'date.booking',
  INCIDENT_START_DATETIME: 'incident.startdatetime',
  ADMISSION_DATE: 'date.admission',
  DATETIME_START: 'ol.datetimestart',

  TIME_COMPLETED: 'time.completed',
  DATETIME_RELEASED: 'ol.datetime_released',
  RELEASE_DATE: 'publicsafety.ReleaseDate',
  INCIDENT_END_DATETIME: 'incident.enddatetime',
  DATETIME_RELEASE: 'ol.datetime_release',
  DATETIME_END: 'ol.datetimeend'
};

export const DEFAULT_PERSON_PROPERTY_TYPES = [
  PROPERTY_TYPES.FIRST_NAME,
  PROPERTY_TYPES.MIDDLE_NAME,
  PROPERTY_TYPES.LAST_NAME,
  PROPERTY_TYPES.SUFFIX,
  PROPERTY_TYPES.NICKNAME,
  PROPERTY_TYPES.SSN,
  PROPERTY_TYPES.DOB,
  PROPERTY_TYPES.RACE,
  PROPERTY_TYPES.ETHNICITY,
  PROPERTY_TYPES.SEX,
  PROPERTY_TYPES.GENDER,
  PROPERTY_TYPES.MARITAL_STATUS,
  PROPERTY_TYPES.MUGSHOT,
  PROPERTY_TYPES.PICTURE
];

export const DURATION_MINUTE_TYPES = {
  [PROPERTY_TYPES.DURATION_MINUTES]: PROPERTY_TYPES.DATETIME_ALERTED,
  [PROPERTY_TYPES.POLICE_MINUTES_PER_PERSON]: PROPERTY_TYPES.DATETIME_ALERTED,
  [PROPERTY_TYPES.FIRE_DEPT_MINUTES_PER_PERSON]: PROPERTY_TYPES.DATETIME_ALERTED,
  [PROPERTY_TYPES.EMS_MINUTES_PER_PERSON]: PROPERTY_TYPES.DATETIME_ALERTED,
  [PROPERTY_TYPES.ORGANIZATION_TIME]: PROPERTY_TYPES.DATETIME_START
};

export const DURATION_HOUR_TYPES = {
  [PROPERTY_TYPES.DURATION_HOURS]: PROPERTY_TYPES.INCIDENT_START_DATETIME
};

export const DURATION_DAY_TYPES = {
  [PROPERTY_TYPES.DURATION_DAYS]: PROPERTY_TYPES.DATE_BOOKED,
  [PROPERTY_TYPES.TIME_SERVED_DAYS]: PROPERTY_TYPES.BOOKING_DATE,
  [PROPERTY_TYPES.HOUSING_LENGTH_OF_STAY]: PROPERTY_TYPES.ADMISSION_DATE
};

export const DURATION_TYPES = Object.assign(
  {},
  DURATION_MINUTE_TYPES,
  DURATION_HOUR_TYPES,
  DURATION_DAY_TYPES
);

export const IMAGE_PROPERTY_TYPES = [
  PROPERTY_TYPES.MUGSHOT,
  PROPERTY_TYPES.PICTURE
];

export const DEFAULT_IGNORE_PROPERTY_TYPES = [
  PROPERTY_TYPES.ENTRY_UPDATED
];

export const DATE_DATATYPES = [
  'Date',
  'DateTimeOffset'
];

export const PROPERTY_TAGS = {
  HIDE: 'hidebydefault',
  TITLE: 'breadcrumbs',
  TIMELINE: 'timeline',
  DURATION: 'duration',
  START: 'startdatetag'
};
