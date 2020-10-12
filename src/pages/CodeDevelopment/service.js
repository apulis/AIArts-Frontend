import Request from 'umi-request';
import request from '@/utils/request';
import { statusMap } from './serviceController';
import { deleteJob } from '@/services/modelTraning';

const CancelToken = Request.CancelToken;

export async function getCodes(params) {
  return await request('/codes', {
    params,
    cancelToken: new CancelToken(function (c) {
      getCodes.cancel = c;
    }),
  });
}

export async function searchData(params) {
  return await request('/codes', {
    params,
  });
}

export async function stopCode(id) {
  return await request(`/codes/${id}`, { method: 'DELETE' })
}

export async function deleteCode(id) {
  return await deleteJob(id)
}

export async function getJupyterUrl(id) {
  return await request(`/codes/${id}/jupyter`)
}

export async function getResource() {
  return await request(`/common/resource`, {});
}

export async function postCode1(data) {
  return await request(`/codes`, {
    method: 'POST',
    data,
  });
}

export async function getCodeCount() {
  const response = await request('/common/job/summary', {
    params: { jobType: 'codeEnv' },
    cancelToken: new CancelToken(function (c) {
      getCodeCount.cancel = c;
    }),
  });
  const { code, data, msg } = response;
  const myRes = { code, msg };
  if (data) {
    const keys = Object.keys(data);
    let allCounts = 0;
    const myData = keys.map((key) => {
      allCounts += data[key];
      return { status: key, desc: `${statusMap[key].local} (${data[key]})` };
    });
    myData.unshift({ status: 'all', desc: `${statusMap['all'].local} (${allCounts})` });
    myRes['data'] = myData;
  }
  return myRes;
}

export async function createSaveImage(data) {
  return await request('/saved_imgs', {
    method: 'POST',
    data,
  });
}
