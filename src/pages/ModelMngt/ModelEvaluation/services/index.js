import request from '@/utils/request';
import { modelEvaluationType } from '@/utils/const';

export async function getTrainingJobs(params) {
  return request(`/trainings`, {
    params
  });
}

export async function getEvaluations(params) {
  return request(`/evaluations`, {
    params
  });
}

export async function addEvaluation(param) {
  return await request(`/evaluations`, {
    method: 'POST',
    param,
  });
}
// export async function addEvaluation(id, data) {
//   return await request(`/models/${id}/evaluation`, {
//     method: 'POST',
//     data,
//   });
// }

export async function stopEvaluation(id) {
  return await request(`/evaluations/${id}`, {
    method: 'DELETE',
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
  // return request(`/models/${id}/evaluation`);
  return request(`/evaluations/${id}`);
}

export async function fetchJobStatusSumary() {
  return await request(`/common/job/summary?jobType=${modelEvaluationType}`);
}

export async function saveEvaluationParams(data) {
  return await request('/templates', {
    method: 'POST',
    data
  })
}

