import request from '../utils/request';


export async function submitModelTraining(data) {
  return await request('/training', {
    method: 'POST',
    data: {
      training: data,
    },
  })
}

export async function fetchTrainingDetail(id) {
  return await request(`/training/${id}`)
}

export async function fetchTrainingLog(id) {
  return await request(`/training/${id}/log`)
}

export async function stopTraining(id) {
  return await request(`/api/training/${id}/stop`, {
    method: 'POST'
  })
}

export async function removeTraining(id) {
  return await request(`/api/training/${id}`, {
    method: 'DELETE'
  })
}