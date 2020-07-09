import request from '@/utils/request';

export async function getCodes(pageNum, pageSize) {
  return request('/codes', {
    params: { pageNum, pageSize },
  });
}
export async function getResource(data) {
  return await request(`/codes/upload`, {
    method: 'POST',
    data: data,
  });
}
export async function postCode() {
  return request(`/codes`);
}

export async function deleteCode() {
  return request(`/codes`, { method: 'DELETE' })
}