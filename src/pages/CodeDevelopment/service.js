import request from '@/utils/request';

export async function getCodes(page, count) {
  debugger
  return request('/codes', {
    params: { page, pageSize:count },
  });
}

export async function getDatasetDetail(id) {
  return request(`/api/datasets/${id}`);
}

export async function edit(id, data) {
  return await request(`/api/dataset/${id}`, {
    method: 'POST',
    data: data,
  });
}

export async function deleteDataSet(id) {
  return request(`/api/datasets/${id}`, { method: 'DELETE' })
}

export async function upload(data) {
  return await request(`/api/dataset/upload`, {
    method: 'POST',
    data: data,
  });
}

export async function add(data) {
  return await request(`/api/dataset`, {
    method: 'POST',
    data: data,
  });
}