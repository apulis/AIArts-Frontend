import request from '../utils/request';


export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data: {
      training: data,
    },
  })
}

export async function fetchAvilableResource() {
  return await request('/common/resource')
}

export async function fetchTrainingList() {
  return await request(`/trainings`, {
    params: {
      pageNum: 1,
      pageSize: 999,
    }
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

export async function removeTrainings(id) {
  return await request(`/api/trainings/${id}`, {
    method: 'DELETE'
  })
}