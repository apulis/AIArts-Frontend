import { parse } from 'querystring';
import pathRegexp from 'path-to-regexp';
import { isObject } from './types';

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
export const normalizeTableResult = data => {
  if (Array.isArray(data)) {
    return {
      list: data || [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    };
  }
  if (isObject(data)) {
    return {
      list: data.list || [],
      pagination: {
        current: data.pageNum || 1,
        pageSize: data.pageSize || 10,
        total: data.total
      }
    };
  }
  return data;
};

// 文件大小显示转换
export const bytesToSize = bytes => {
  if (bytes === 0) return '0 B';
  const k = 1024; // or 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // eslint-disable-next-line no-restricted-properties
  // return `${(bytes / Math.pow(k, i)).toPrecision(3)} ${sizes[i]}`
  return `${(bytes / Math.pow(k, i)).toFixed(0)} ${sizes[i]}`;
};


export const getJobStatus = (status) => {
  const statusList = {
    'unapproved': '未批准',
    'queued': '队列中',
    'scheduling': '调度中',
    'running': '运行中',
    'finished': '已完成',
    'failed': '已失败',
    'pausing': '暂停中',
    'paused': '已暂停',
    'killing': '关闭中',
    'killed': '已关闭',
    'error': '错误',
    'started at ': '开始于： ',
    'error at ': '发生错误于： ',
    'paused at ': '停止于：',
    'failed at ': '失败于： ',
    'finished at ': '完成于： ',
    'killed at ': '终止于： ',
    'toUse': '可用',
    'waiting for available resource. requested: ': '等待可用资源，已请求资源：',
    '. available: ': '可用资源： ',
  };
  return statusList[status] || '';
};

export const getStatusColor = (status) => {
  const colorList = {
    'error': '#CC0000',
    'failed': '#d48265',
    'finished': '#2f4554',
    'running': '#61a0a8',
    'killed': '#DDDDDD',

    'unapproved': '#91c7ae',
    'queued': '#749f83',
    'scheduling': '#9ACD32',
    'pausing': '#ca8622',
    'paused': '#bda29a',
    'killing': '#C0C0C0',
  };
  return colorList[status] || '#1890ff';
};

export const getModelStatus = (status) => {
  const statusList = {
    'normal': '正常',
    'deleting': '删除中',
  };
  return statusList[status] || '';
};
// Regular任务类型，根据nodeType返回可选设备数量数组
export const getDeviceNumArrByNodeType = (nodeInfo, type) => {
  if (nodeInfo == undefined || !type) {
    return []
  }
  // gpu
  if (type === 'nvidia_gpu_amd64') {
    let arr = [];
    for (let index in nodeInfo) {
      const nodeItem = nodeInfo[index];
      if (nodeItem['gpuType'] === type) {
        // gpu
        if (nodeItem['gpuType'] == 'nvidia_gpu_amd64') {
          const capacityObj = nodeItem['gpu_capacity'];
          arr.push(capacityObj[type]);

        }
      }
    }
    const num = Math.max(...arr);
    let arr2 = [];
    for (let i = 0; i <= num; i++) {
      arr2.push(i);
    }
    return arr2;
  }
  // npu
  return [0, 1, 2, 4, 8];
};
// PSDistJob任务类型，根据nodeType返回每个节点的可选设备数组
export const getDeviceNumPerNodeArrByNodeType = (nodeInfo, type) => {
  if (nodeInfo == undefined || !type) {
    return []
  }
  // gpu
  if (type === 'nvidia_gpu_amd64') {
    let arr = [];
    for (let index in nodeInfo) {
      const nodeItem = nodeInfo[index];
      if (nodeItem['gpuType'] === type) {
        // gpu
        if (nodeItem['gpuType'] == 'nvidia_gpu_amd64') {
          const capacityObj = nodeItem['gpu_capacity'];
          arr.push(capacityObj[type]);

        }
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
  }
  // npu
  return [8];
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
  var reg = /[\u4e00-\u9fa5]/g,    //专业匹配中文
    slice = str.substring(0, len),
    chineseCharNum = (~~(slice.match(reg) && slice.match(reg).length)),
    realen = slice.length * 2 - chineseCharNum;
  return str.substr(0, realen) + (realen < str.length ? "..." : "");
};

export const formatParams = (obj) => {
  let result = [];
  for (let key in obj) {
    if (!key) continue;
    result.push(`${key}=${obj[key]}`);
  }
  return result;
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
  }
}
// 防抖
export const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.call(this);
    }, delay)
  }
}

export const getDeviceType = () => {
  
}