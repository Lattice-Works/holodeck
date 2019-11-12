/*
 * @flow
 */

/*
 * https://github.com/mixer/uuid-validate
 * https://github.com/chriso/validator.js
 *
 * this regular expression comes from isUUID() from the validator.js library. isUUID() defaults to checking "all"
 * versions, but that means we lose validation against a specific version. for example, the regular expression returns
 * true for '00000000-0000-0000-0000-000000000000', but this UUID is technically not valid.
 */
const BASE_UUID_PATTERN :RegExp = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i;

function isValidUUID(value :any) :boolean {

  return BASE_UUID_PATTERN.test(value);
}

const isNotNumber = (number :string | number) :boolean => {
  if (number === null || number === undefined) return true;
  let formattedStr = `${number}`;
  const suffix = formattedStr.match(/\.0*$/);
  if (suffix) {
    formattedStr = formattedStr.slice(0, suffix.index);
  }
  const floatVal = Number.parseFloat(formattedStr);
  return Number.isNaN(floatVal) || floatVal.toString() !== formattedStr;
};

const isNotInteger = (number :string | number) :boolean => {
  if (number === null || number === undefined) return true;
  const numberStr = `${number}`;
  const intVal = parseInt(numberStr, 10);
  return Number.isNaN(intVal) || intVal.toString() !== numberStr;
};

export {
  isNotInteger,
  isNotNumber,
  isValidUUID,
};
