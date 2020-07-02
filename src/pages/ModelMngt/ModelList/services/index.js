import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getModels(params) {
  return request(`${MOCK_URL}/api/models`, {
    params
  });
}

export async function deleteModel(projectId) {
  return request(`/api/models/${projectId}`, {
    method: 'DELETE',
  });
}

export async function addModel(data) {
  return await request('/api/models', {
    method: 'POST',
    data: data,
  });
}

export async function updateModel(params = {}) {
  return await request(`${MOCK_URL}/api/models/update`, {
    method: 'POST',
    params
  });
}
