import request from '@/utils/request';

export async function getDatasets(page, count) {
  return request('/datasets', {
    params: { page, count },
  });
}

export async function getDatasetDetail(id) {
  return request(`/datasets/${id}`);
}

export async function edit(id, data) {
  return await request(`/dataset/${id}`, {
    method: 'POST',
    data: data,
  });
}

export async function deleteDataSet(id) {
  return request(`/datasets/${id}`, { method: 'DELETE' })
}

export async function upload(data) {
  return await request(`/dataset/upload`, {
    method: 'POST',
    data: data,
  });
}

export async function add(data) {
  return await request(`/dataset`, {
    method: 'POST',
    data: data,
  });
}