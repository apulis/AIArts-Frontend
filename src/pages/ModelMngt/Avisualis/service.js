import request from '@/utils/request';

export async function getAvisualis(params) {
  return request('/models', {
    params: params,
  });
}

export async function getPanel(type) {
  return request(`/models/${type}/panel`);
}

export async function getAvisualisDetail(id) {
  return request(`/models/${id}`);
}

export async function submitAvisualis(data) {
  return await request(`/models`, {
    method: 'POST',
    data: data,
  });
}

export async function deleteAvisualis(id) {
  return await request(`/models/${id}`, {
    method: 'DELETE'
  });
}