import request from '@/utils/request';

const prefix = 'edge_inferences';

export async function getEdgeInferences(params) {
  return request(`/${prefix}`, {
    params: params,
  });
}

export async function submit(data) {
  return await request(`/${prefix}`, {
    method: 'POST',
    data: data,
  });
}

export async function getTypes() {
  return request(`/${prefix}/conversion_types`);
}

export async function getFD() {
  return request(`/${prefix}/fdinfo`);
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