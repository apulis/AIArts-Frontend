import request from '../utils/request';

export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data
  });
}

export async function fetchAvilableResource() {
  return await request('/common/resource');
}

export async function fetchTrainingList({pageNum, pageSize, status, search}) {
  return await request(`/trainings/`, {
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
      status: status || 'all',
      searchWord: search || undefined,
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
  return await request(`templates/${id}`);
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
  })
}

export async function fetchJobStatusSumary() {
  return await request('/common/job/summary?jobType=artsTraining');
}
