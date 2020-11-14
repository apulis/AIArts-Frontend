import request from '@/utils/request';

export async function getPieData(params) {
  return await request('/common/job/summary', {
    params: params,
  });
}
