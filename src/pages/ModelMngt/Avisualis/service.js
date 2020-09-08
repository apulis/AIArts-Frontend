import request from '@/utils/request';

export async function getAvisualis(params) {
  return request('/models', {
    params: params,
  });
}

export async function getPanel(type) {
  return request(`/models/${type}/panel`);
}

export async function getAvisualisDetail(params) {
  return request('/models', {
    params: params,
  });
}