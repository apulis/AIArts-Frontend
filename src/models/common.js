import { setI18n } from '@/utils/utils';
import { getPlatformConfig } from '../services/common';

export const locales = ['zh-CN', 'en-US'];

const common = {
  namespace: 'common',
  state: {
    interval: localStorage.interval === 'null' ? null : Number(localStorage.interval) || 3000,
    platformName: '',
    i18n: locales.includes(localStorage.language) ? localStorage.language : navigator.language,
    enableVC: false,
  },
  effects: {
    *changeInterval({ payload }, { put }) {
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
    *fetchPlatformConfig({ payload }, { call, put }) {
      const res = yield call(getPlatformConfig);
      if (res.code === 0) {
        // if (typeof res.i18n === 'string') {
        //   setI18n(res.i18n);
        //   yield call(setCookieLang, res.i18n);
        //   yield put({
        //     type: 'saveLang',
        //     payload: {
        //       language: res.i18n,
        //     }
        //   })
        // }
        if (locales.includes(res.i18n)) {
          setI18n(res.i18n);
        }
        yield put({
          type: 'savePlatform',
          payload: {
            platformName: res.platformName,
            i18n: res.i18n,
            enableVC: res.enableVC,
          },
        });
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
