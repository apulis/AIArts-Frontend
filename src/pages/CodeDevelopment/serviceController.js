import { getDeviceNumArrByNodeType, getDeviceNumPerNodeArrByNodeType } from '../../utils/utils.js';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { formatMessage } from 'umi';
export const statusMap = {
  all: {
    local: formatMessage({ id: 'service.status.all' }),
    priority: 0,
  },
  unapproved: {
    local: formatMessage({ id: 'service.status.unapproved' }),
    priority: 1,
  },
  queued: {
    local: formatMessage({ id: 'service.status.queued' }),
    priority: 2,
  },
  scheduling: {
    local: formatMessage({ id: 'service.status.scheduling' }),
    priority: 3,
  },
  running: {
    local: formatMessage({ id: 'service.status.running' }),
    priority: 4,
  },
  finished: {
    local: formatMessage({ id: 'service.status.finished' }),
    priority: 5,
  },
  failed: {
    local: formatMessage({ id: 'service.status.failed' }),
    priority: 6,
  },
  pausing: {
    local: formatMessage({ id: 'service.status.pausing' }),
    priority: 7,
  },
  paused: {
    local: formatMessage({ id: 'service.status.paused' }),
    priority: 8,
  },
  killing: {
    local: formatMessage({ id: 'service.status.killing' }),
    priority: 9,
  },
  killed: {
    local: formatMessage({ id: 'service.status.killed' }),
    priority: 10,
  },
  Killed: {
    local: formatMessage({ id: 'service.status.killed' }),
    priority: 10,
  },
  error: {
    local: formatMessage({ id: 'service.status.error' }),
    priority: 11,
  },
};
export const canOpenStatus = new Set(['running']);
export const canStopStatus = new Set(['unapproved', 'queued', 'scheduling', 'running']);
export const canUploadStatus = new Set(['running']);
export const utilGetDeviceNumArr = getDeviceNumArrByNodeType;
export const utilGetDeviceNumPerNodeArr = getDeviceNumPerNodeArrByNodeType;
export const sortColumnMap = {
  name: 'jobName',
  createTime: 'jobTime',
};
export const pageObj = PAGEPARAMS;
export const sortTextMap = sortText;
