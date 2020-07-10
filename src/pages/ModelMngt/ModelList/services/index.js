import request from '@/utils/request';

export async function getModels(params) {
  return request(`/models`, {
    params
  });
}

export async function deleteModel(modelId) {
  return request(`/models/${modelId}`, {
    method: 'DELETE',
  });
}

export async function addModel(data) {
  return await request('/models', {
    method: 'POST',
    data: data,
  });
}

export async function updateModel(params = {}) {
  return await request(`/models/${params.modelId}`, {
    method: 'POST',
    params
  });
}

export async function downloadModel(modelId) {
  return request(`/files/download/model/${modelId}`, {
    method: 'GET'
  });
}
