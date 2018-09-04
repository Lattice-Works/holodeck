export const PERSON_ENTITY_TYPE_FQN = 'general.person';

export const PROPERTY_TYPES = {
  /* Person-specific property types */
  FIRST_NAME: 'nc.PersonGivenName',
  LAST_NAME: 'nc.PersonSurName',
  MIDDLE_NAME: 'nc.PersonMiddleName',
  SUFFIX: 'nc.PersonSuffix',
  SEX: 'nc.PersonSex',
  RACE: 'nc.PersonRace',
  ETHNICITY: 'nc.PersonEthnicity',
  DOB: 'nc.PersonBirthDate',
  SSN: 'nc.SSN',
  MUGSHOT: 'publicsafety.mugshot',
  PICTURE: 'person.picture'
};

export const DATE_DATATYPES = [
  'Date',
  'DateTimeOffset'
];
