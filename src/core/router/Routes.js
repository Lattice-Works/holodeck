/*
 * @flow
 */

const ID_PATH :':id' = ':id';

/*
 * App
 */
const ROOT :string = '/';
const LOGIN :string = '/login';

/*
 * Data Explorer
 */
const EXPLORE :string = '/explore';
const EXPLORE_ES :string = `${EXPLORE}/${ID_PATH}`;

/*
 * Top Utilizers
 */
const TOP_UTILIZERS :string = '/toputilizers';
const TOP_UTILIZERS_ES :string = `${TOP_UTILIZERS}/${ID_PATH}`;

export {
  EXPLORE,
  EXPLORE_ES,
  ID_PATH,
  LOGIN,
  ROOT,
  TOP_UTILIZERS,
  TOP_UTILIZERS_ES,
};
