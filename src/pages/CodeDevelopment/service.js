import request from '@/utils/request';

export async function getCodes(params) {
  return request('/codes', {
    params,
  });
}

export async function deleteCode(id) {
  return request(`/codes/${id}`, { method: 'DELETE'})
}

export async function getResource() {
  return await request(`/common/resource`, {
  });
}

export async function postCode(data) {
  return request(`/codes`,{
    method:'POST',
    data
  });
}
