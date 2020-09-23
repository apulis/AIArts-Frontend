export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};
export const isEmptyString = (str) => {
  if (typeof str === 'undefined' || str === '') {
    return true;
  } else {
    return false;
  }
};
