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
  PICTURE: 'person.picture'
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

export const DATE_DATATYPES = [
  'Date',
  'DateTimeOffset'
];
