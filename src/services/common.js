import request from '../utils/request'

export async function fetchCommonResource() {
  return await request('/common/resources');
}