import request from '@/utils/request';

export async function getDatasets(params) {
  return await request('/datasets', {
    params: params,
  });
}

export async function getDatasetDetail(id) {
  return await request(`/datasets/${id}`);
}

export async function edit(id, data) {
  return await request(`/datasets/${id}`, {
    method: 'POST',
    data: data,
  });
}

export async function deleteDataSet(id) {
  return await request(`/datasets/${id}`, { method: 'DELETE' });
}

export async function upload(data) {
  return await request(`/dataset/upload`, {
    method: 'POST',
    data: data,
  });
}

export async function add(data) {
  return await request(`/datasets`, {
    method: 'POST',
    data: data,
  });
}

export async function download(id) {
  return await request(`/files/download/dataset/${id}`);
}
