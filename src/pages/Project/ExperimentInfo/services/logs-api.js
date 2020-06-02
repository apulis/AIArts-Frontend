import request from '@/utils/request';
import { MOCK_URL } from '@/config'

export async function getExperimentLogs(params) {
  return request(`${MOCK_URL}/api/project/experiment/log/list`, {
    params
  });
}