import moment from 'moment';
import { isDate } from './types';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

/**
 * 格式化时间
 * @param {Number|String|Date} value 日期
 * @param {String} format 时间格式
 */
export const formatDate = (value, format = 'YYYY-MM-DD') => {
  let tempFormat = format;
  if (!value) return '';
  if (!isDate(value)) return '';
  // eslint-disable-next-line prefer-destructuring
  if (Array.isArray(format)) tempFormat = format[0];
  const tempDate = moment.isMoment(value) ? value : moment(value);
  return tempDate.format(tempFormat);
};

/**
 * 格式化为时间戳
 * @param {Number|String|Date} value 日期
 */
export const parseDate = (value) => {
  if (!value) return null;
  if (!isDate(value)) return null;
  const tempDate = moment.isMoment(value) ? value : moment(value);
  return tempDate.valueOf();
};

/**
 * 格式化为moment格式
 * @param {Number|String|Date} value 日期
 */
export const toMoment = (value) => {
  if (!value) return undefined;
  if (!isDate(value)) return undefined;
  const tempDate = moment.isMoment(value) ? value : moment(value);
  return tempDate;
};

/**
 * 格式化duration
 * @param {Number|String|Date} duration
 */
export const formatDuration = (duration) => {
  return `${duration.hours()}:${duration.minutes()}:${duration.seconds()}`;
};

export default moment;
