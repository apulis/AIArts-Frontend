import request from '@/utils/request';

export async function getTrainingJobs(params) {
  return request(`/trainings`, {
    params
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
  return request(`/inferences/GetEvaluationDetail`, {
    params: {
      evaluationId: id,
    }
  });
}