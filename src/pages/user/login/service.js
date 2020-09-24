import request from 'umi-request';

export async function fakeAccountLogin(params) {
  return await request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}
