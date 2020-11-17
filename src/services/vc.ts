import request from '@/utils/request';
import requestUser from '@/utils/request-user';

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

export const fetchUsers = (pageNo: number, pageSize: number, search: string) => {
  return requestUser('/users/list', {
    params: {
      pageNo,
      pageSize,
      search,
    }
  })
}

export const addUsersForVC = (userIds: number, vcName: string) => {
  return requestUser('/vc/userforvc', {
    method: 'POST',
    data: {
      userIds,
      vcName,
    }
  })
}