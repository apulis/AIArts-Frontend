import request from '../utils/request';
import requestUser from '../utils/request-user';

export async function fetchCommonResource() {
  return await request('/common/resources');
}

export async function getPlatformConfig() {
  return await requestUser('/platform-config');
}

export function getFullLogContent(jobId: string) {
  return request(`/common/jobs/${jobId}/raw_log`);
}


export function getPresetImages() {
  return request<{
    category: string
    desc: string
    image: string
  }[]>('/common/images')
}