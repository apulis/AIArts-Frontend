import request from '@/utils/request';

export async function getProject(page, size) {
  return request('/api/projects', {
    params: { page, size },
  });
}

export async function deleteProject(projectId) {
  return request(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
}

export async function submit(data) {
  return await request('/api/projects', {
    method: 'POST',
    data: data,
  });
}

export async function edit(projectId, data) {
  return await request(`/api/projects/${projectId}`, {
    method: 'PATCH',
    data: data,
  });
}
