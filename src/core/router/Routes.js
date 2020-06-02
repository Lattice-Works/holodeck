/*
 * @flow
 */

const ESID_PARAM :':entitySetId' = ':entitySetId';
const EKID_PARAM :':entityKeyId' = ':entityKeyId';
const ID_PARAM :':id' = ':id';

export {
  ESID_PARAM,
  EKID_PARAM,
  ID_PARAM,
};

const ROOT :'/' = '/';

const EXPLORE :'/explore' = '/explore';
const LOGIN :'/login' = '/login';

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ENTITY_SET :'/explore/entitySet/:entitySetId' = `${EXPLORE}/entitySet/${ESID_PARAM}`;
// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ENTITY_SET_SEARCH :'/explore/entitySet/:entitySetId/search' = `${ENTITY_SET}/search`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ENTITY_DATA :'/explore/entityData/:entitySetId/:entityKeyId' = `${EXPLORE}/entityData`
  + `/${ESID_PARAM}`
  + `/${EKID_PARAM}`;

export {
  ENTITY_DATA,
  ENTITY_SET,
  ENTITY_SET_SEARCH,
  EXPLORE,
  LOGIN,
  ROOT,
};
