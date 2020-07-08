import { extend } from 'umi-request';

import { errorHandler } from './request'


const userPrefix = '/custom-user-dashboard-backend';


const request = extend({
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  prefix: userPrefix
});

request.use(async (ctx, next) => {
  await next();
  // 统一对结果进行处理
  console.log(1231231111, ctx.res)
  if (ctx.res.success === true) {
    ctx.res.code = 0;
  }
})

request.interceptors.request.use(async (url, options) => {
  const token = localStorage.getItem('token');
  if (token) {
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'application/json',
      Authorization: 'Bearer ' + token,
    };
    return {
      url: url,
      options: { ...options, headers: headers },
    };
  }
});

request.interceptors.response.use(async (response, options) => {
  return response;
});

export default request;