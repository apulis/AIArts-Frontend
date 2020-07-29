import request from '@/utils/request';

export async function getTrainingJobs(params) {
  return request(`/trainings`, {
    params
  });
}

export async function addEvaluation(id, data) {
  return await request(`/models/${id}/evaluation`, {
    method: 'POST',
    data,
  });
}

export async function fetchEvaluationLog(id) {
  return request(`/inferences/GetEvaluationLog`, {
    params: {
      evaluationId: id,
    }
  });
}

export async function fetchEvaluationDetail(id) {
  return request(`/models/${id}/evaluation`);
}