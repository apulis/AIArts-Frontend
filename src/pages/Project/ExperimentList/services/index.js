import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getExperiments(params) {
  return request(`${MOCK_URL}/api/experiments`, {
    params
  });
}

export async function deleteExperiment(projectId) {
  return request(`/api/experiments/${projectId}`, {
    method: 'delete',
  });
}

export async function addExperiment(data) {
  return await request('/api/experiments', {
    method: 'post',
    data: data,
  });
}

export async function updateExperiment(params = {}) {
  return await request(`${MOCK_URL}/api/experiments`, {
    method: 'update',
    // method: 'post',
    params
  });
}
