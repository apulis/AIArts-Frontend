import request from '../utils/request';
import { modelTrainingType } from '@/utils/const';

export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data
  });
}

export async function fetchAvilableResource() {
  const data = await request('/common/resource');
  return data;
}

export async function fetchTrainingList({ pageNum, pageSize, status, search, sortedInfo }) {
  return await request(`/trainings/`, {
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
      status: status || 'all',
      searchWord: search || undefined,
      orderBy: sortedInfo?.orderBy || undefined,
      order: sortedInfo?.order || undefined,
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
  return await request(`/templates`, { params });
}

export async function fetchTemplateById(id) {
  return await request(`/templates/${id}`);
}

export async function removeTemplate(id) {
  return await request(`/templates/${id}`, {
    method: 'DELETE'
  });
}

export async function saveTrainingParams(data) {
  return await request('/templates', {
    method: 'POST',
    data
  });
}

export async function updateParams(data) {
  return await request('/templates', {
    method: 'PUT',
    data
  });
}

export async function fetchJobStatusSumary() {
  return await request(`/common/job/summary?jobType=${modelTrainingType}`);
}

export async function fetchPresetTemplates() {
  return await request(`/templates`, {
    params: {
      pageNum: 1,
      pageSize: 10000,
      jobType: modelTrainingType,
      scope: 3,
    }

  });
}

export async function fetchPresetModel(id) {
  return request(`/models/${id}`);
}

export async function deleteJob(jobId) {
  return await request('/inferences/DeleteJob', {
    method: 'DELETE',
    params: {
      jobId,
    }
  });
}

export async function fetchVisualizations(params) {
  return await request(`/visual/list`, { params });
}

export async function createVisualization(params) {
  return await request('/visual', {
    method: 'POST',
    data: params
  });
}

export async function deleteVisualization(id) {
  return await request(`/templates/`, {
    method: 'DELETE',
    params: {
      id: id
    }
  });
}