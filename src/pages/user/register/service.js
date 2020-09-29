import request from 'umi-request';

export async function fakeRegister(params) {
  return await request('/api/register', {
    method: 'POST',
    data: params,
  });
}
