import React from 'react';
import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { formatMessage, setLocale } from 'umi';
import { isObject } from './types';
import { checkIfGpuOrNpu } from '@/models/resource';
import requestUser from './request-user';

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = (path) => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);
/**
 * props.route.routes
 * @param router [{}]
 * @param pathname string
 */

export const getAuthorityFromRouter = (router = [], pathname) => {
  const authority = router.find(
    ({ routes, path = '/' }) =>
      (path && pathRegexp(path).exec(pathname)) ||
      (routes && getAuthorityFromRouter(routes, pathname)),
  );
  if (authority) return authority;
  return undefined;
};

export const getRouteAuthority = (path, routeData) => {
  let authorities;
  routeData.forEach((route) => {
    // match prefix
    if (pathRegexp(`${route.path}/(.*)`).test(`${path}/`)) {
      if (route.authority) {
        authorities = route.authority;
      } // exact match

      if (route.path === path) {
        authorities = route.authority || authorities;
      } // get children authority recursively

      if (route.routes) {
        authorities = getRouteAuthority(path, route.routes) || authorities;
      }
    }
  });
  return authorities;
};

/**
 * 规范化返回的列表数据
 * @param {Object} data 列表数据
 */
export const normalizeTableResult = (data) => {
  if (Array.isArray(data)) {
    return {
      list: data || [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
    };
  }
  if (isObject(data)) {
    return {
      list: data.list || [],
      pagination: {
        current: data.pageNum || 1,
        pageSize: data.pageSize || 10,
        total: data.total,
      },
    };
  }
  return data;
};

// 文件大小显示转换
export const bytesToSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024; // or 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // eslint-disable-next-line no-restricted-properties
  // return `${(bytes / Math.pow(k, i)).toPrecision(3)} ${sizes[i]}`
  return `${(bytes / Math.pow(k, i)).toFixed(0)} ${sizes[i]}`;
};

export const getStatusList = () => [
  { value: 'all', label: formatMessage({ id: 'service.status.all' }) },
  { value: 'unapproved', label: formatMessage({ id: 'service.status.unapproved' }) },
  { value: 'queued', label: formatMessage({ id: 'service.status.queued' }) },
  { value: 'scheduling', label: formatMessage({ id: 'service.status.scheduling' }) },
  { value: 'running', label: formatMessage({ id: 'service.status.running' }) },
  { value: 'finished', label: formatMessage({ id: 'service.status.finished' }) },
  { value: 'failed', label: formatMessage({ id: 'service.status.failed' }) },
  { value: 'pausing', label: formatMessage({ id: 'service.status.pausing' }) },
  { value: 'paused', label: formatMessage({ id: 'service.status.paused' }) },
  { value: 'killing', label: formatMessage({ id: 'service.status.killing' }) },
  { value: 'killed', label: formatMessage({ id: 'service.status.killed' }) },
  { value: 'Killed', label: formatMessage({ id: 'service.status.killed' }) },
  { value: 'error', label: formatMessage({ id: 'service.status.error' }) },
];

export const getJobStatus = (status) => {
  const statusList = {
    all: formatMessage({ id: 'service.status.all' }),
    unapproved: formatMessage({ id: 'service.status.unapproved' }),
    queued: formatMessage({ id: 'service.status.queued' }),
    scheduling: formatMessage({ id: 'service.status.scheduling' }),
    running: formatMessage({ id: 'service.status.running' }),
    finished: formatMessage({ id: 'service.status.finished' }),
    failed: formatMessage({ id: 'service.status.failed' }),
    pausing: formatMessage({ id: 'service.status.pausing' }),
    paused: formatMessage({ id: 'service.status.paused' }),
    killing: formatMessage({ id: 'service.status.killing' }),
    killed: formatMessage({ id: 'service.status.killed' }),
    Killed: formatMessage({ id: 'service.status.killed' }),
    error: formatMessage({ id: 'service.status.error' }),
  };
  return statusList[status] || '';
};

export const getStatusColor = (status) => {
  const colorList = {
    error: '#CC0000',
    failed: '#d48265',
    finished: '#2f4554',
    running: '#61a0a8',
    killed: '#DDDDDD',
    Killed: '#DDDDDD',

    unapproved: '#91c7ae',
    queued: '#749f83',
    scheduling: '#9ACD32',
    pausing: '#ca8622',
    paused: '#bda29a',
    killing: '#C0C0C0',
  };
  return colorList[status] || '#1890ff';
};

export const getModelStatus = (status) => {
  const statusList = {
    normal: '正常',
    deleting: '删除中',
  };
  return statusList[status] || '';
};
// Regular任务类型，根据nodeType返回可选设备数量数组
export const getDeviceNumArrByNodeType = (nodeInfo, type) => {
  if (nodeInfo == undefined || !type) {
    return [];
  }
  if (checkIfGpuOrNpu(type) === 'GPU') {
    let arr = [];
    for (let index in nodeInfo) {
      const nodeItem = nodeInfo[index];
      if (nodeItem['gpuType'] === type) {
        const capacityObj = nodeItem['gpu_capacity'] || 0;
        arr.push(capacityObj[type]);
      }
    }
    const num = Math.max(...arr);
    let arr2 = [];
    for (let i = 0; i <= num; i++) {
      arr2.push(i);
    }
    return arr2;
  } else if (checkIfGpuOrNpu(type) === 'NPU') {
    return [0, 1, 2, 4, 8];
  }
};
// PSDistJob任务类型，根据nodeType返回每个节点的可选设备数组
export const getDeviceNumPerNodeArrByNodeType = (nodeInfo, type) => {
  if (nodeInfo == undefined || !type) {
    return [];
  }
  // gpu
  if (checkIfGpuOrNpu(type) === 'GPU') {
    let arr = [];
    for (let index in nodeInfo) {
      const nodeItem = nodeInfo[index];
      if (nodeItem['gpuType'] === type) {
        const capacityObj = nodeItem['gpu_capacity'] || 0;
        arr.push(capacityObj[type]);
      }
    }
    const num = Math.max(...arr);
    let arr2 = [];
    let temp = 1;
    while (temp <= num) {
      arr2.push(temp);
      temp *= 2;
    }
    return arr2;
  } else if (checkIfGpuOrNpu(type) === 'NPU') {
    return [8];
  }
};

export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};
export const isEmptyString = (str) => {
  if (typeof str === 'undefined' || str === '') {
    return true;
  } else {
    return false;
  }
};

export const omitText = function (str, len = 20) {
  if (!str) {
    return '';
  }
  var reg = /[\u4e00-\u9fa5]/g, //专业匹配中文
    slice = str.substring(0, len),
    chineseCharNum = ~~(slice.match(reg) && slice.match(reg).length),
    realen = slice.length * 2 - chineseCharNum;
  return str.substr(0, realen) + (realen < str.length ? '...' : '');
};

export const formatParams = (obj) => {
  let result = [];
  for (let key in obj) {
    if (!key) continue;
    result.push(`${key}=${obj[key]}`);
  }
  return result;
};

export const formatParamsToFormValues = (params) => {
  return Object.entries(params).map((item) => {
    var obj = {};
    obj['key'] = item[0];
    obj['value'] = item[1];
    return obj;
  });
};

// 节流
export const throttle = (fn, delay) => {
  let lastTime = 0;
  return function () {
    let nowTime = Date.now();
    if (nowTime - lastTime > delay) {
      fn.call(this);
      lastTime = nowTime;
    }
  };
};
// 防抖
export const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.call(this);
    }, delay);
  };
};

export const getDeviceType = () => {};

export const downloadStringAsFile = function (content, filename) {
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  eleLink.download = filename;
  eleLink.style.display = 'none';
  // 字符内容转变成blob地址
  var blob = new Blob([content]);
  eleLink.href = URL.createObjectURL(blob);
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
};

export const checkIfCanDelete = (status) => {
  return !['pausing', 'running', 'killing'].includes(status);
};

export const checkIfCanStop = (status) => {
  return ['unapproved', 'queued', 'scheduling', 'running'].includes(status);
};

export function setI18n(lang) {
  localStorage.language = lang;
  requestUser('/language/' + lang);
  setLocale(lang, false);
}

export function capFirstLetter(s = '') {
  return s.replace(/\b(\w)(\w*)/g, function (_$0, $1, $2) {
    return $1.toUpperCase() + $2.toLowerCase();
  });
}
