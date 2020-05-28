/*
 * @flow
 */

const ENTITY_SET_ID_PARAM :':entitySetId' = ':entitySetId';
const ENTITY_KEY_ID_PARAM :':entityKeyId' = ':entityKeyId';
const ID_PARAM :':id' = ':id';

/*
 * App
 */
const ROOT :string = '/';
const LOGIN :string = '/login';
const LINKING_PATH :string = '/linking';

/*
 * Data Explorer
 */
const EXPLORE :string = '/explore';
const EXPLORE_ES :string = `${EXPLORE}/${ID_PARAM}`;

const EXPLORE_ENTITY :string = `${EXPLORE}/${ENTITY_SET_ID_PARAM}/${ENTITY_KEY_ID_PARAM}`;
const ENTITY_LINKING :string = `${EXPLORE_ENTITY}${LINKING_PATH}`;

/*
 * Top Utilizers
 */
const TOP_UTILIZERS :string = '/toputilizers';
const TOP_UTILIZERS_ES :string = `${TOP_UTILIZERS}/${ID_PARAM}`;

export {
  ENTITY_KEY_ID_PARAM,
  ENTITY_LINKING,
  ENTITY_SET_ID_PARAM,
  EXPLORE,
  EXPLORE_ES,
  ID_PARAM,
  LOGIN,
  ROOT,
  TOP_UTILIZERS,
  TOP_UTILIZERS_ES,
};
