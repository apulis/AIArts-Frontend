import request from '../utils/request';
import requestUser from '../utils/request-user';

export async function fetchCommonResource() {
  return await request('/common/resources');
}

export async function getPlatformConfig() {
  return await requestUser('/platform-config');
}
