import request from '@/utils/request';

export async function getModels(params) {
  return await request(`/models`, {
    params,
  });
}

export async function deleteModel(modelId) {
  return await request(`/pretrainedModels/${modelId}`, {
    method: 'DELETE',
  });
}

export async function addModel(data) {
  return await request('/pretrainedModels', {
    method: 'POST',
    data: data,
  });
}

export async function updateModel(params = {}) {
  return await request(`/pretrainedModels/${params.id}`, {
    method: 'POST',
    data: { description: params.description },
  });
}
