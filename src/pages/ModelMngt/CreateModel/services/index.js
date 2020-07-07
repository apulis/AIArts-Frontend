import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getTrainingJobs(params) {
  return request(`/jobs`, {
    params
  });
}