/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification, message } from 'antd';
import { stringify } from 'querystring';
import { USER_LOGIN_URL } from '@/utils/const';
import { formatMessage } from 'umi';

const prefix = '/ai_arts/api';
let codeMessage = undefined;
let bizCodeMessage = undefined;

/**
 * 异常处理程序
 */

export const errorHandler = async (error) => {
  if (!codeMessage) {
    codeMessage = {
      200: formatMessage({ id: 'codeMessage.200' }),
      201: formatMessage({ id: 'codeMessage.201' }),
      202: formatMessage({ id: 'codeMessage.202' }),
      204: formatMessage({ id: 'codeMessage.204' }),
      400: formatMessage({ id: 'codeMessage.400' }),
      401: formatMessage({ id: 'codeMessage.401' }),
      403: formatMessage({ id: 'codeMessage.403' }),
      404: formatMessage({ id: 'codeMessage.404' }),
      406: formatMessage({ id: 'codeMessage.406' }),
      410: formatMessage({ id: 'codeMessage.410' }),
      422: formatMessage({ id: 'codeMessage.422' }),
      500: formatMessage({ id: 'codeMessage.500' }),
      502: formatMessage({ id: 'codeMessage.502' }),
      503: formatMessage({ id: 'codeMessage.503' }),
      504: formatMessage({ id: 'codeMessage.504' }),
    };
  }
  if (!bizCodeMessage) {
    bizCodeMessage = {
      30005: formatMessage({ id: 'bizCodeMessage.30005' }),
      30007: formatMessage({ id: 'bizCodeMessage.30007' }),
      20001: formatMessage({ id: 'bizCodeMessage.20001' }),
      30010: formatMessage({ id: 'bizCodeMessage.30010' }),
      30014: formatMessage({ id: 'bizCodeMessage.30014' }),
      30603: formatMessage({ id: 'bizCodeMessage.30603' }),
      30012: formatMessage({ id: 'bizCodeMessage.30012' }),
      30701: formatMessage({ id: 'bizCodeMessage.30701' }),
      //
      30000: formatMessage({ id: 'bizCodeMessage.30000' }),
      30001: formatMessage({ id: 'bizCodeMessage.30001' }),
      30002: formatMessage({ id: 'bizCodeMessage.30002' }),
      30003: formatMessage({ id: 'bizCodeMessage.30003' }),
      30004: formatMessage({ id: 'bizCodeMessage.30004' }),
      30006: formatMessage({ id: 'bizCodeMessage.30006' }),
      30008: formatMessage({ id: 'bizCodeMessage.30008' }),
      30009: formatMessage({ id: 'bizCodeMessage.30009' }),
      30013: formatMessage({ id: 'bizCodeMessage.30013' }),
      30201: formatMessage({ id: 'bizCodeMessage.30201' }),
      30202: formatMessage({ id: 'bizCodeMessage.30202' }),
      30203: formatMessage({ id: 'bizCodeMessage.30203' }),
      30205: formatMessage({ id: 'bizCodeMessage.30205' }),
      30801: formatMessage({ id: 'bizCodeMessage.30801' }),
      30802: formatMessage({ id: 'bizCodeMessage.30802' }),
      30803: formatMessage({ id: 'bizCodeMessage.30803' }),
    };
  }
  const { response } = error;
  let _response;
  try {
    _response = await response.json();
  } catch (e) {
    console.log('request error', e);
    // notification.error({
    //   message: '请求错误',
    //   description: '请稍后再试',
    // });
  }
  if (!_response) {
    return {};
  }
  const CODE = _response.code;
  const hasMessage = bizCodeMessage[CODE] || _response.msg;
  if (CODE !== 0 && hasMessage) {
    if (hasMessage.length < 200) {
      message.error(hasMessage);
    }
  }
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    if (status === 401) {
      const href = window.location.href;
      if (!/localhost/.test(href)) {
        const queryString = stringify({
          redirect: window.location.href,
        });
        window.location.href = `${USER_LOGIN_URL}?` + queryString;
      }
    }
    !hasMessage &&
      notification.error({
        message: `${formatMessage({ id: 'request.error.tips' })} ${status}: ${url}`,
        description: errorText,
      });
  }
  return response;
};
/**
 * 配置request请求时的默认参数
 */

const request = extend({
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
  prefix: prefix,
});

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

export default request;
