/*
 * @flow
 */

import moment from 'moment';
import { List } from 'immutable';

import { DATE_FORMAT, TIME_FORMAT } from './constants/DateTimeConstants';

export const formatDate = (dateStr :string) :string => {
  const dateMoment = moment(dateStr);
  if (dateMoment.isValid()) {
    return dateMoment.format(DATE_FORMAT);
  }
  return '';
};

export const formatDateList = (dateList :List<string>) :string => dateList
  .map(dateStr => formatDate(dateStr)).filter(str => str.length).join(', ');

export const formatDateTime = (dateTimeStr :string) :string => {
  const dtMoment = moment(dateTimeStr);
  if (dtMoment.isValid()) {
    return dtMoment.format(`${DATE_FORMAT} ${TIME_FORMAT}`);
  }
  return '';
};

export const formatDateTimeList = (dateTimeList :List<string>) :string => dateTimeList
  .map(dateTimeStr => formatDateTime(dateTimeStr)).filter(str => str.length).join(', ');

export function toISODateTime(momentObj) {
  let momentStr;
  if (momentObj && momentObj.isValid && momentObj.isValid()) {
    momentStr = momentObj.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  }
  return momentStr;
}

export function toISODate(momentObj) {
  let momentStr;
  if (momentObj && momentObj.isValid && momentObj.isValid()) {
    momentStr = momentObj.format('YYYY-MM-DD');
  }
  return momentStr;
}
