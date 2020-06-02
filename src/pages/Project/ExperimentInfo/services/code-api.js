import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getExperimentCode(params) {
  return request(`${MOCK_URL}/api/project/experiment/code/list`, {
    params
  });
}