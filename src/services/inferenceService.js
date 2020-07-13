import request from '../utils/request'


export async function fetchInferenceList() {
  return await request('/inferences')
}

export async function fetchInferenceDetail(id) {
  return await request('/inferences/' + id)
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
