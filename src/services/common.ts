import request from '../utils/request';
import requestUser from '../utils/request-user';
import { downloadStringAsFile } from '../utils/utils';

export async function fetchCommonResource() {
  return await request('/common/resources');
}

export async function getPlatformConfig() {
  return await requestUser('/platform-config');
}

export function getFullLogContent(jobId: string) {
  return request(`/common/jobs/${jobId}/raw_log`);
}
