import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getInferences(params) {
  return request(`/inferences`, {
    params
  });
}

export async function deleteInference(projectId) {
  return request(`/api/inferences/${projectId}`, {
    method: 'DELETE',
  });
}

export async function addInference(data) {
  return await request('/api/inferences', {
    method: 'POST',
    data: data,
  });
}

export async function updateInference(params = {}) {
  return await request(`${MOCK_URL}/api/inferences/update`, {
    method: 'POST',
    params
  });
}
