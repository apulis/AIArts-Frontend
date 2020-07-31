import request from '../utils/request'
import { inferenceJobType } from '@/utils/const';

export async function fetchInferenceList() {
  return await request('/inferences')
}

export async function fetchInferenceDetail(id) {
  return await request('/inferences/GetJobDetail', {
    params: {
      jobId: id
    }
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
    }
  })
}

export async function getAllSupportInference() {
  return await request('/inferences/GetAllSupportInference')
}

export async function getAllComputedDevice() {
  return await request('/inferences/GetAllDevice')
}