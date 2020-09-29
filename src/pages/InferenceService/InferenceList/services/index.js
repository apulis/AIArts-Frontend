import request from '@/utils/request';
import Request from 'umi-request';

import { inferenceJobType } from '@/utils/const';

const CancelToken = Request.CancelToken;

export async function getInferences(params) {
  return request(`/inferences/ListInferenceJob`, {
    params,
    cancelToken: new CancelToken(function (c) {
      getInferences.cancel = c;
    }),
  });
}

export async function stopInference(params) {
  return request(`/inferences/KillJob`, {
    params,
  });
}

export async function deleteInference(jobId) {
  return request(`/inferences/DeleteJob?jobId=${jobId}`, {
    method: 'DELETE',
  });
}

// export async function deleteInference(jobId) {
//   return request(`/inferences/${jobId}`, {
//     method: 'DELETE',
//   });
// }

export async function addInference(data) {
  return await request('/inferences', {
    method: 'POST',
    data: data,
  });
}

export async function updateInference(data = {}) {
  return await request(`/inferences/update`, {
    method: 'POST',
    data,
  });
}

export async function fetchJobStatusSumary() {
  return await request(`/common/job/summary?jobType=${inferenceJobType}`, {
    cancelToken: new CancelToken(function (c) {
      fetchJobStatusSumary.cancel = c;
    }),
  });
}
