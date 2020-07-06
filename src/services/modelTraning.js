import request from '../utils/art-request';


export async function submitModelTraining(data) {
  return await request('/trainings', {
    method: 'POST',
    data,
  })
}