import request from '@/utils/request';

export async function getPieData(params) {
  return request(`/common/job/summary`, {
    params: params,
  });
}