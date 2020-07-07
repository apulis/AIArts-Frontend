import request from '../utils/request';


export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data,
  })
}

export async function fetchTrainingDetail(id) {
  return await request(`/trainings/${id}`)
}

export async function fetchTrainingLog(id) {
  return await request(`/trainings/${id}/log`)
}

export async function stopTraining(id) {
  return await request(`/api/trainings/${id}/stop`, {
    method: 'POST'
  })
}

export async function removeTraining(id) {
  return await request(`/api/trainings/${id}`, {
    method: 'DELETE'
  })
}