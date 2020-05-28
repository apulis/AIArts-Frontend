import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getProjects(params) {
  return request(`${MOCK_URL}/api/projects`, {
    params
  });
}

export async function deleteProject(projectId) {
  return request(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function addProject(data) {
  return await request('/api/projects', {
    method: 'POST',
    data: data,
  });
}

export async function updateProject(projectId, data) {
  return await request(`${MOCK_URL}/api/projects/${projectId}`, {
    method: 'PATCH',
    data: data,
  });
}
