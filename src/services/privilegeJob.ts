import request from '@/utils/request';

export const fetchPrivilegeJobConfig = () => {
  return request('/settings/privileged');
}

export const submitPrivilegeJobConfig = (data: { isEnable: boolean; bypassCode: string }) => {
  return request('/settings/privileged', {
    method: 'POST',
    data,
  });
}
