import request from '@/utils/request';

export async function getCodes(params) {
  return request('/codes', {
    params,
  });
}
export async function searchData(params) {
  return request('/codes', {
    params,
  });
}
export async function deleteCode(id) {
  return request(`/codes/${id}`, { method: 'DELETE'})
}
export async function getJupyterUrl(id) {
  return request(`/codes/${id}/jupyter`)
}

export async function getResource() {
  return await request(`/common/resource`, {
  });
}

export async function postCode1(data) {
  return request(`/codes`,{
    method:'POST',
    data
  });
}
export async function postCode2(data) {
  return {
    coded:0,
    data:{},
    msg:'success'
  }
  // return request(`/codes`,{
  //   method:'POST',
  //   data
  // });
}
const arr = ['全部(30)','创建中(1)','创建失败(15)','排队中(6)','运行中(5)','停止中(0)','排队中(6)','运行中(5)','停止中(0)','排队中(6)','运行中(5)','停止中(0)']
export async function getCodeCount() {
  return {
    code:0,
    data:{counts:arr},
    msg:'success'
  }
  // return request('/codes', {
  //   params,
  // });
}