import request from '@/utils/request-grafana';

export async function getIP(start, end) {
  return request(`/series?match[]=node_uname_info&start=${start}&end=${end}`);
}

export async function getPie(query) {
  return request(`/query?query=${query}`);
}