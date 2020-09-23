import moment from 'moment';

export function isString(obj) {
  return Object.prototype.toString.call(obj) === '[object String]';
}

export function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export function isHtmlElement(node) {
  return node && node.nodeType === Node.ELEMENT_NODE;
}

export const isFunction = (functionToCheck) => {
  const getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

export const isUndefined = (val) => val === undefined;

export const isDefined = (val) => val !== undefined && val !== null;

export const isNumeric = (value) => !Number.isNaN(parseFloat(value)) && Number.isFinite(value);

export const isDate = (date, format) => {
  if (!date) return false;
  if (Number.isNaN(+new Date(date))) return false;
  const tempDate = moment.isMoment(date) ? date : moment(date);
  const parsed = moment(tempDate, format, !!format);
  return parsed.isValid();
};
