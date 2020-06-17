import request from '@/utils/request';

export async function getDatasets(page, count) {
  return request('/api/datasets', {
    params: { page, count },
  });
}

export async function getDatasetDetail(datasetId) {
  return request(`/api/datasets/${datasetId}`);
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
