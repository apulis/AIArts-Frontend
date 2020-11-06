import request from '@/utils/request';


export const createVC = () => {

}


export const deleteVC = (vcName: string) => {
  return request('/vc', {
    method: 'DELETE',
    params: {
      name: vcName,
    }
  })
}

export const modifyVC = () => {
  //
}

export const checkActiveJob = (vcName: string) => {
  
}

export const fetchVCList = (pageSize: number, pageNum: number, search: string) => {
  return request(``)
}