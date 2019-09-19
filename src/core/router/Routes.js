/*
 * @flow
 */

const ID_PATH :':id' = ':id';

export const ROOT :string = '/';
export const LOGIN :string = '/login';

export const TOP_UTILIZERS :string = '/toputilizers';
export const REPORTS :string = '/reports';
export const MANAGE :string = '/manage';

/*
 * Data Explorer
 */
const EXPLORE :string = '/explore';
const EXPLORE_ES :string = `${EXPLORE}/${ID_PATH}`;

export {
  EXPLORE,
  EXPLORE_ES,
  ID_PATH,
};
