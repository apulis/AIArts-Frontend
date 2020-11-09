import request from '@/utils/request';


export const createVC = (data: { vcName: string, quota: string, metadata: string }) => {
  return request('/vc', {
    method: 'POST',
    data,
  })
}


export const deleteVC = (vcName: string) => {
  return request('/vc', {
    method: 'DELETE',
    data: {
      vcName,
    }
  })
}

export const modifyVC = (data: { vcName: string, quota: string, metadata: string }) => {
  return request('/vc', {
    method: 'PUT',
    data,
  })
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