/*
 * @flow
 */

const ADSID_PARAM :':atlasDataSetId' = ':atlasDataSetId';
const ESID_PARAM :':entitySetId' = ':entitySetId';
const EKID_PARAM :':entityKeyId' = ':entityKeyId';
const ID_PARAM :':id' = ':id';
const ORG_ID_PARAM :':organizationId' = ':organizationId';

export {
  ADSID_PARAM,
  EKID_PARAM,
  ESID_PARAM,
  ID_PARAM,
  ORG_ID_PARAM,
};

const ROOT :'/' = '/';

const EXPLORE :'/explore' = '/explore';
const LOGIN :'/login' = '/login';

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ENTITY_SET :'/explore/entitySets/:entitySetId' = `${EXPLORE}/entitySets/${ESID_PARAM}`;
// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ENTITY_SET_SEARCH :'/explore/entitySets/:entitySetId/search' = `${ENTITY_SET}/search`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ENTITY_DATA :'/explore/entityData/:entitySetId/:entityKeyId' = `${EXPLORE}/entityData`
  + `/${ESID_PARAM}`
  + `/${EKID_PARAM}`;

// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ORG :'/explore/orgs/:organizationId' = `${EXPLORE}/orgs/${ORG_ID_PARAM}`;
// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ATLAS_DATA_SETS :'/explore/orgs/:organizationId/dataSets' = `${ORG}/dataSets`;
// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ATLAS_DATA_SET :'/explore/orgs/:organizationId/dataSets/:atlasDataSetId' = `${ATLAS_DATA_SETS}/${ADSID_PARAM}`;
// $FlowFixMe - ignoring flow because I prefer the code hints to show the value
const ATLAS_DATA_SET_VIEW :'/explore/orgs/:organizationId/dataSets/:atlasDataSetId/view' = `${ATLAS_DATA_SET}/view`;

export {
  ATLAS_DATA_SET,
  ATLAS_DATA_SETS,
  ATLAS_DATA_SET_VIEW,
  ENTITY_DATA,
  ENTITY_SET,
  ENTITY_SET_SEARCH,
  EXPLORE,
  LOGIN,
  ORG,
  ROOT,
};
