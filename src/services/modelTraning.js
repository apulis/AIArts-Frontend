import request from '../utils/request';
import { PAGEPARAMS } from '@/utils/const';

export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data
  });
}

export async function fetchAvilableResource() {
  return await request('/common/resource');
}

export async function fetchTrainingList() {
  return await request(`/trainings`, {
    params: {
      pageNum: 1,
      pageSize: 999,
    }
  });
}

export async function fetchTrainingDetail(id) {
  return await request(`/trainings/${id}`);
}

export async function fetchTrainingLog(id) {
  return await request(`/trainings/${id}/log`);
}

export async function stopTraining(id) {
  return await request(`/trainings/${id}/stop`, {
    method: 'POST'
  });
}

export async function removeTrainings(id) {
  return await request(`/trainings/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchTemplates(params) {
  return await request(`/Templates`, { params });
}

export async function fetchTemplateById(id) {
  return await request(`Templates/${id}`);
}

export async function removeTemplate(id) {
  return await request(`/Templates/${id}`, {
    method: 'DELETE'
  });
}