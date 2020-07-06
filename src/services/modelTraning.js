import request from '../utils/request';


export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data,
  })
}