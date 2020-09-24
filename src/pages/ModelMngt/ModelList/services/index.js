import request from '@/utils/request';

export async function getModels(params) {
  return await request(`/models`, {
    params,
  });
}

export async function getModel(modelId) {
  return await request(`/models/${modelId}`, {
    method: 'GET',
  });
}

export async function deleteModel(modelId) {
  return await request(`/models/${modelId}`, {
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
  return await request(`/models/${params.id}`, {
    method: 'POST',
    data: { description: params.description },
  });
}

export async function downloadModel(modelId) {
  return await request(`/files/download/model/${modelId}`, {
    method: 'GET',
  });
}
