import request from '@/utils/request';
import Request from 'umi-request';

const prefix = 'edge_inferences';
const CancelToken = Request.CancelToken;

export async function getEdgeInferences(params) {
  return await request(`/${prefix}`, {
    params: params,
    cancelToken: new CancelToken(function (c) {
      getEdgeInferences.cancel = c;
    }),
  });
}

export async function submit(data) {
  return await request(`/${prefix}`, {
    method: 'POST',
    data: data,
  });
}

export async function getTypes() {
  return await request(`/${prefix}/conversion_types`);
}

export async function getFD() {
  return await request(`/${prefix}/fdinfo`);
}

export async function submitFD(data) {
  return await request(`/${prefix}/fdinfo`, {
    method: 'POST',
    data: data,
  });
}

export async function push(data) {
  return await request(`/${prefix}/push/${data.jobId}`, {
    method: 'POST',
    data: data,
  });
}

export async function deleteEG(id) {
  return await request(`/${prefix}/${id}`, {
    method: 'DELETE',
  });
}
