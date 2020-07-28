import request from '@/utils/request';
import moment from 'moment';
const versionList = [
  {
      id: 10,
      version: '1.1.8',
  },
  {
      id: 9,
      version: '1.1.7',
  },
  {
      id: 8,
      version: '1.1.0',
  },
]
const versionInfo = {
  id:'',
  name:'1.0.0',
  time:'2020.07.21',
  creator:'bifeng.peng',
  desc:'最奈斯的版本，没有之一',
}
const versionLogs = [
  'v1.0.1,更新于2020.07.21',
  'v1.0.1,更新于2020.07.21',
  'v1.0.1,更新于2020.07.21',
  'v1.0.1,更新于2020.07.21',
]
// export async function getVersionDetail(id) {
//   return {
//     code:0,
//     data:{
//       id:id,
//       name:'1.0.1',
//       time:'2020.07.21',
//       desc:'xxxxxxxxxx',
//     },
//     msg:'success'
//   }
//   // return request('/codes');
// }
export async function getInitData() {
  const response =  await request('/version/info');
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    const info = data.versionInfo
    const logs = data.versionLogs
    myRes['data'] = {
      versionInfo:{
        id:info.id,
        name:info.version,
        creator:info.creator,
        time:moment(info.updatedAt).format('YYYY/MM/DD HH:MM'),
        desc:info.description
      },
      versionLogs:logs.map((item)=>{
        return `${moment(item.updatedAt).format('YYYY/MM/DD HH:MM')}，${item.creator} 将版本更新为 ${item.version}`
      }).slice(0,10)
    }
  }
  return myRes
}
export async function getUpgradeInfo(){
  const response =  await request('/version/env/local');
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    myRes['data'] = {
      canUpgrade:data.canUpgrade,
      isLowerVersion:data.isLower
    }
  }
  return myRes
}
export async function upgrade(){
  const response = await request('/version/upgrade/local',{method:'POST'});
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    myRes['data'] = {}
  }
  return myRes
}
export async function getUpgradeLog(){
  const response = await request('/version/upgradeLog');
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    myRes['data'] = {
      status:data.status,
      logs:data.logString
    }
  }
  return myRes
}