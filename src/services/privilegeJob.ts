import request from '@/utils/request';

export const fetchPrivilegeJobConfig = () => {
  return request('/settings/privileged');
}

export const submitPrivilegeJobConfig = (data: { isEnable: boolean; bypasscode: string }) => {
  return request('/settings/privileged', {
    method: 'POST',
    data,
  });
}
