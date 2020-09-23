import request from '@/utils/request';

export async function getTrainingJobs(params) {
  return request(`/trainings`, {
    params,
  });
}
