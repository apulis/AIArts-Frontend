import request from '@/utils/request-grafana';
import request2 from '@/utils/request';

export async function getIp(start, end) {
  return request(`/series?match[]=node_uname_info&start=${start}&end=${end}`);
}

export async function getDatasets(params) {
  return request2('/datasets', {
    params: params,
  });
}