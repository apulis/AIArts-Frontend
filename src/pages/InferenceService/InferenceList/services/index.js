import request from '@/utils/request';

export async function getInferences(params) {
  return request(`/inferences/ListInferenceJob`, {
    params
  });
}

export async function stopInference(params) {
  return request(`/inferences/KillJob`, {
    params
  });
}

export async function deleteInference(jobId) {
  return request(`/api/inferences/DeleteJob?jobId=${jobId}`, {
    method: 'DELETE',
  });
}

// export async function deleteInference(jobId) {
//   return request(`/api/inferences/${jobId}`, {
//     method: 'DELETE',
//   });
// }

export async function addInference(data) {
  return await request('/api/inferences', {
    method: 'POST',
    data: data,
  });
}

export async function updateInference(params = {}) {
  return await request(`/api/inferences/update`, {
    method: 'POST',
    params
  });
}
