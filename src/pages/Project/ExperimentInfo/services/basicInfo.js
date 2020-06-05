// import request from '@/utils/request';
import request from 'umi-request';
import { MOCK_URL } from '@/config'

export async function query(params) {
  return request(`${MOCK_URL}/api/experiment/queryById`, {
    params
  });
}