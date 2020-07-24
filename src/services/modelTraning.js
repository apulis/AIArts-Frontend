import request from '../utils/request';


export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data
  })
}

export async function fetchAvilableResource() {
  return await request('/common/resource')
}

export async function fetchTrainingList({pageNum, pageSize, status, search}) {
  return await request(`/trainings`, {
    params: {
      pageNum: pageNum,
      pageSize: pageSize,
      status: status || 'all',
      searchWord: search || undefined,
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
  return await request(`/trainings/${id}/stop`, {
    method: 'POST'
  })
}

export async function removeTrainings(id) {
  return await request(`/trainings/${id}`, {
    method: 'DELETE'
  })
}