import { Reducer } from 'redux';
import { Effect } from 'dva';

import { setI18n } from '@/utils/utils';
import { getPlatformConfig } from '../services/common';
import { fetchPrivilegeJobEnable } from '@/services/privilegeJob';

export const locales = ['zh-CN', 'en-US'];

export interface CommonStateType {
  interval: number | null;
  platformName: string;
  i18n: string | boolean;
  enableVC: boolean;
  enableAvisuals: boolean;
  enablePrivileged: boolean;
}

export interface CommonModelType {
  namespace: 'common';
  state: CommonStateType;
  effects: {
    changeInterval: Effect;
    fetchPlatformConfig: Effect;
  };
  reducers: {
    updateInterval: Reducer;
    savePlatform: Reducer;
  };
}

const common: CommonModelType = {
  namespace: 'common',
  state: {
    interval: localStorage.interval === 'null' ? null : Number(localStorage.interval) || 3000,
    platformName: '',
    i18n: locales.includes(localStorage.language) ? localStorage.language : navigator.language,
    enableVC: false,
    enableAvisuals: false,
    enablePrivileged: false,
  },
  effects: {
    * changeInterval({ payload }, { put }) {
      if (payload === 0) {
        payload = null;
      }
      // 先停止
      yield put({
        type: 'updateInterval',
        payload: null,
      });
      // 再重启定时器
      yield put({
        type: 'updateInterval',
        payload,
      });
      if (payload) {
        localStorage.interval = payload;
      } else {
        localStorage.interval = payload;
      }
    },
    * fetchPlatformConfig({ payload }, { call, put }) {
      const res = yield call(getPlatformConfig);
      if (res.code === 0) {
        // res.i18n = 'en-US'; // 开发
        if (locales.includes(res.i18n)) {
          setI18n(res.i18n);
        }
        yield put({
          type: 'savePlatform',
          payload: {
            platformName: res.platformName,
            i18n: res.i18n,
            enableVC: res.enableVC,
            enableAvisuals: res.enableAvisuals,
          },
        });
      }
      const privilegedJob = yield call(fetchPrivilegeJobEnable);
      if (privilegedJob.code === 0) {
        const enablePrivileged = privilegedJob.data.isEnable;
        console.log('enablePrivileged', enablePrivileged)
        yield put({
          type: 'savePlatform',
          payload: {
            enablePrivileged: enablePrivileged
          }
        })
      }
    },
  },
  reducers: {
    updateInterval(state, { payload }) {
      return {
        ...state,
        interval: payload,
      };
    },
    savePlatform(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default common;
