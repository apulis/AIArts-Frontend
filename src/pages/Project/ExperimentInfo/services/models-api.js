import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getExperimentModels(params) {
  return request(`${MOCK_URL}/api/project/experiment/model/list`, {
    params
  });
}