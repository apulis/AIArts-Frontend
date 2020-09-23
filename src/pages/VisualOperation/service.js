import request from '@/utils/request';
import moment from 'moment';
export async function getInitData() {
  const response = await request('/version/info');
  const { code, data, msg } = response;
  const myRes = { code, msg };
  if (data) {
    const info = data.versionInfo;
    const logs = data.versionLogs;
    myRes['data'] = {
      versionInfo: {
        id: info.id,
        name: info.version,
        creator: info.creator,
        time: moment(info.updatedAt).format('YYYY/MM/DD HH:mm'),
        desc: info.description,
      },
      versionLogs: logs.map((item) => {
        return `${moment(item.updatedAt).format('YYYY/MM/DD HH:mm')}，${
          item.creator
        } 将版本更新为 ${item.version}`;
      }),
      isUpgrading: data.isUpgrading,
    };
  }
  return myRes;
}
export async function getUpgradeInfo() {
  const response = await request('/version/env/local');
  const { code, data, msg } = response;
  const myRes = { code, msg };
  if (data) {
    myRes['data'] = {
      canUpgrade: data.canUpgrade,
      isLowerVersion: data.isLower,
    };
  }
  return myRes;
}
export async function upgrade() {
  const response = await request('/version/upgrade/local', { method: 'POST' });
  const { code, data, msg } = response;
  const myRes = { code, msg };
  if (data) {
    myRes['data'] = {};
  }
  return myRes;
}
export async function getUpgradeLog() {
  const response = await request('/version/upgradeLog');
  const { code, data, msg } = response;
  const myRes = { code, msg };
  if (data) {
    myRes['data'] = {
      status: data.status,
      logs: data.logString,
    };
  }
  return myRes;
}
