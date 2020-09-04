import Request from 'umi-request';
import request from '../utils/request';

const CancelToken = Request.CancelToken;

export async function fetchInferenceList() {
  return await request('/inferences')
}

export async function fetchInferenceDetail(id) {
  return await request('/inferences/GetJobDetail', {
    params: {
      jobId: id
    },
    cancelToken: new CancelToken(function(c) {
      fetchInferenceDetail.cancel = c;
    })
  })
}

export async function createInference(data) {
  return await request('/inferences/PostInferenceJob', {
    method: 'POST',
    data,
  })
}

export async function startRecognition(id) {
  return await request(`/inferences/${id}/recognition`, {
    method: 'POST',
    data,
  })
}


export async function fetchInferenceLog(id) {
  return await request(`/inferences/GetJobLog`, {
    params: {
      jobId: id,
    },
    cancelToken: new CancelToken(function(c) {
      fetchInferenceLog.cancel = c;
    })
  })
}

export async function getAllSupportInference() {
  return await request('/inferences/GetAllSupportInference')
}

export async function getAllComputedDevice() {
  return await request('/inferences/GetAllDevice')
}