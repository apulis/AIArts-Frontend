import request from '@/utils/request';


export const createVC = () => {

}


export const deleteVC = (vcName: string) => {
  return request('/vc', {
    method: 'DELETE',
    params: {
      vcName,
    }
  })
}

export const modifyVC = () => {
  //
}

export const checkActiveJob = (vcName: string) => {
  return request('/vc/count', {
    params: {
      targetStatus: ['running', 'scheduling', 'killing', 'pausing'],
      vcName,
      type: 1,
    }
  })
}

export const fetchAvailDevice = () => {
  return request('/vc/count', {
    params: {
      type: 2,
    }
  })
}

export const fetchVCList = <T>(pageSize: number, pageNum: number, search: string) => {
  return request<T>('/vc/list', {
    params: {
      pageNum,
      pageSize,
      keyword: search,
    }
  })
}