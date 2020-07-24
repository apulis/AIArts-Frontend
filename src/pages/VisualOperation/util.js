export const isEmptyObject = (obj)=>{
  return Object.keys(obj).length===0
}
function isEmptyString(obj) {
  if (typeof obj === 'undefined' || obj == null || obj === '') {
    return true;
  } else {
    return false;
  }
}