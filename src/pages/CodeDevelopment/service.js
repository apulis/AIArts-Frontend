import request from '@/utils/request';
import {statusMap} from './serviceController'
import {deleteJob} from '@/services/modelTraning'
import { forEach } from 'lodash';

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
export async function stopCode(id) {
  return request(`/codes/${id}`, { method: 'DELETE'})
}
export async function deleteCode(id) {
  return deleteJob(id)
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
export async function getCodeCount() {
  const response =  await request('/common/job/summary', {
    params:{jobType:'codeEnv'},
  });
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    const keys = Object.keys(data)
    let allCounts = 0
    const myData = keys.map((key)=>{
      allCounts+=data[key]
      return {status:key,desc:`${statusMap[key].local} (${data[key]})`}
    })
    myData.unshift({status:'all',desc:`全部 (${allCounts})`})
    myRes['data'] = myData
  }
  return myRes
}