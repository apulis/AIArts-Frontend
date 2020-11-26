import Request from 'umi-request';
import request from '../utils/request';
import { modelTrainingType } from '@/utils/const';

const CancelToken = Request.CancelToken;

// TODO
export async function getImages() {
  return await request('/common/images', {})
}


export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data,
  });
}

export async function fetchAvilableResource(vcName) {
  const data = await request('/common/resource', {
    params: {
      vcName,
    }
  });
  return data;
}

export async function fetchTrainingList({ pageNum, pageSize, status, search, sortedInfo, vcName }) {
  return await request(`/trainings/`, {
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
      status: status || 'all',
      searchWord: search || undefined,
      orderBy: sortedInfo?.orderBy || undefined,
      order: sortedInfo?.order || undefined,
      vcName: vcName,
    },
    cancelToken: new CancelToken(function (c) {
      fetchTrainingList.cancel = c;
    }),
  });
}

export async function fetchTrainingDetail(id) {
  return await request(`/trainings/${id}`, {
    cancelToken: new CancelToken(function (c) {
      fetchTrainingDetail.cancel = c;
    }),
  });
}

export async function fetchTrainingLog(id, page) {
  return await request(`/trainings/${id}/log`, {
    params: { pageNum: page },
    cancelToken: new CancelToken(function (c) {
      fetchTrainingLog.cancel = c;
    }),
  });
}

export async function stopTraining(id) {
  return await request(`/trainings/${id}/stop`, {
    method: 'POST',
  });
}

export async function removeTrainings(id) {
  return await request(`/trainings/${id}`, {
    method: 'DELETE',
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
    method: 'DELETE',
  });
}

export async function saveTrainingParams(data) {
  return await request('/templates', {
    method: 'POST',
    data,
  });
}

export async function updateParams(data) {
  return await request('/templates', {
    method: 'PUT',
    data,
  });
}

export async function fetchJobStatusSumary(vcName) {
  return await request(`/common/job/summary`, {
    params: {
      jobType: modelTrainingType,
      vcName
    }
  });
}

export async function fetchPresetTemplates() {
  return await request(`/templates`, {
    params: {
      pageNum: 1,
      pageSize: 10000,
      jobType: modelTrainingType,
      scope: 3,
    },
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
    },
  });
}

export async function fetchVisualizations(params) {
  return await request(`/visual/list`, { params });
}

export async function createVisualization(params) {
  return await request('/visual', {
    method: 'POST',
    params,
  });
}

export async function deleteVisualization(id) {
  return await request(`/visual/`, {
    method: 'DELETE',
    params: {
      id: id,
    },
  });
}

export async function switchVisualizationJobStatus(id, action) {
  return await request(`/visual/`, {
    method: 'PUT',
    params: {
      id: id,
      status: action,
    },
  });
}

export async function getTensorboardUrl(id) {
  return await request(`/visual/endpoints`, {
    method: 'GET',
    params: {
      id: id,
    },
  });
}

export async function getUserDockerImages() {
  return await request(`/saved_imgs`, {
    method: 'GET',
    params: {
      pageNum: 1,
      pageSize: 9999,
    },
  });
}
