import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getCodes(params) {
  return request(`${MOCK_URL}/api/codes`, {
    params
  });
}

export async function deleteCode(projectId) {
  return request(`/api/codes/${projectId}`, {
    method: 'DELETE',
  });
}

export async function addCode(data) {
  return await request('/api/codes', {
    method: 'POST',
    data: data,
  });
}

export async function updateCode(params = {}) {
  return await request(`${MOCK_URL}/api/models/update`, {
    method: 'POST',
    params
  });
}
