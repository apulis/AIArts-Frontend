import {getDeviceNumArrByNodeType,getDeviceNumPerNodeArrByNodeType} from '../../utils/utils.js'
export const statusMap = {
  unapproved:{
    local:'未批准',
    priority:1
  },
  queued :{
    local:'队列中',
    priority:2
  },
  scheduling :{
    local:'调度中',
    priority:3
  },
  running :{
    local:'运行中',
    priority:4
  },
  finished :{
    local:'已完成',
    priority:5
  },
  failed:{
    local:'已失败',
    priority:6
  },
  pausing:{
    local:'暂停中',
    priority:7
  },
  paused:{
    local:'已暂停',
    priority:8
  },
  killing :{
    local:'关闭中',
    priority:9
  },
  killed:{
    local:'已关闭',
    priority:10
  },
  error:{
    local:'错误',
    priority:11
  },
}
export const canOpenStatus = new Set(['running'])
export const canStopStatus = new Set(['unapproved','queued','scheduling','running'])
export const canUploadStatus = new Set(['running'])
export const utilGetDeviceNumArr = getDeviceNumArrByNodeType
export const utilGetDeviceNumPerNodeArr = getDeviceNumPerNodeArrByNodeType
