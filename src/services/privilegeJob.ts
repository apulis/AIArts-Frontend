import request from '@/utils/request';

export const fetchPrivilegeJobConfig = () => {
  return request('/settings/privileged', {
    errorHandler: () => {},
  });
}

export const submitPrivilegeJobConfig = (data: { isEnable: boolean; bypassCode: string }) => {
  return request('/settings/privileged', {
    method: 'POST',
    data,
  });
}

export const fetchPrivilegeJobEnable = () => {
  return request('/settings/privileged/enable')
}