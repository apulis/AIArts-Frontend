import request from '../utils/request';

export const deleteImages = async (id) => {
  return await request('/saved_imgs/' + id, {
    method: 'DELETE',
  });
};

export const getImages = async (params) => {
  return await request('/saved_imgs', {
    params: {
      pageNum: params.pageNum,
      pageSize: params.pageSize,
      name: params.search,
    },
  });
};
