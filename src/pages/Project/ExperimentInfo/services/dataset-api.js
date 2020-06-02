import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getExperimentDatasets(params) {
  return request(`${MOCK_URL}/api/project/experiment/dataset/list`, {
    params
  });
}