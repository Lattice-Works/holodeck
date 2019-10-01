/*
 * @flow
 */

import { Models } from 'lattice';

const { FullyQualifiedName } = Models;

const ASSOCIATION_ENTITY_TYPE_FQNS = {};
const ENTITY_TYPE_FQNS = {};
const PROPERTY_TYPE_FQNS = {
  PERSON_BIRTH_DATE_FQN: new FullyQualifiedName('nc.PersonBirthDate'), // TODO: the "nc" namespace must die already!
  PERSON_FIRST_NAME_FQN: new FullyQualifiedName('nc.PersonGivenName'), // TODO: the "nc" namespace must die already!
  PERSON_ID_FQN: new FullyQualifiedName('nc.SubjectIdentification'), // TODO: the "nc" namespace must die already!
  PERSON_LAST_NAME_FQN: new FullyQualifiedName('nc.PersonSurName'), // TODO: the "nc" namespace must die already!
  PERSON_MUGSHOT_FQN: new FullyQualifiedName('publicsafety.mugshot'),
  PERSON_PICTURE_FQN: new FullyQualifiedName('person.picture'),
  PERSON_SEX_FQN: new FullyQualifiedName('nc.PersonSex'), // TODO: the "nc" namespace must die already!
  PERSON_SSN_FQN: new FullyQualifiedName('nc.SSN'), // TODO: the "nc" namespace must die already!
};

const RESERVED_FQNS = {
  AT_COUNT_FQN: new FullyQualifiedName('openlattice.@count'),
};

export {
  ASSOCIATION_ENTITY_TYPE_FQNS,
  ENTITY_TYPE_FQNS,
  PROPERTY_TYPE_FQNS,
  RESERVED_FQNS,
};
