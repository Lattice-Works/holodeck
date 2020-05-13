/*
 * @flow
 */

import isString from 'lodash/isString';

/*
 * https://github.com/mixer/uuid-validate
 * https://github.com/chriso/validator.js
 *
 * this regular expression comes from isUUID() from the validator.js library. isUUID() defaults to checking "all"
 * versions, but that means we lose validation against a specific version. for example, the regular expression returns
 * true for '00000000-0000-0000-0000-000000000000', but this UUID is technically not valid.
 */
const BASE_UUID_PATTERN :RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

function isValidUUID(value :mixed) :boolean %checks {

  return isString(value) && BASE_UUID_PATTERN.test(value);
}

export {
  isValidUUID,
};
