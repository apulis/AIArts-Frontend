import request from '@/utils/request';
import { modelEvaluationType } from '@/utils/const';
import { deleteJob } from '@/services/modelTraning';
import Request from 'umi-request';

const CancelToken = Request.CancelToken;

export async function getTrainingJobs(params) {
  return await request(`/trainings`, {
    params,
  });
}

export async function getEvaluations(params) {
  return await request(`/evaluations`, {
    params,
    cancelToken: new CancelToken(function (c) {
      getEvaluations.cancel = c;
    }),
  });
}

export async function addEvaluation(data) {
  return await request(`/evaluations`, {
    method: 'POST',
    data,
  });
}

export async function stopEvaluation(id) {
  return await request(`/evaluations/${id}`, {
    method: 'DELETE',
  });
}
export async function deleteEvaluation(id) {
  return deleteJob(id);
}

export async function fetchEvaluationLog(id) {
  return await request(`/inferences/GetEvaluationLog`, {
    params: {
      evaluationId: id,
    },
  });
}

export async function fetchEvaluationDetail(id, page) {
  // return request(`/models/${id}/evaluation`);
  return await request(`/evaluations/${id}`, {
    params: {
      pageNum: page || 1,
    },
  });
}

export async function fetchJobStatusSumary() {
  return await request(`/common/job/summary?jobType=${modelEvaluationType}`, {
    cancelToken: new CancelToken(function (c) {
      fetchJobStatusSumary.cancel = c;
    }),
  });
}

export async function saveEvaluationParams(data) {
  return await request('/templates', {
    method: 'POST',
    data,
  });
}

export async function fetchPresetTemplates() {
  return await request(`/templates`, {
    params: {
      pageNum: 1,
      pageSize: 10000,
      jobType: modelEvaluationType,
      scope: 3,
    },
  });
}

export async function getAllLabeledDatasets() {
  return await request('/datasets', {
    params: {
      orderBy: 'created_at',
      order: 'desc',
      isTranslated: true,
      pageNum: 1,
      pageSize: 10000,
    },
  });
}
