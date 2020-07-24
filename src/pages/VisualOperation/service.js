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
  return {
    code:0,
    data:{
      // versionList,
      versionInfo,
      versionLogs,
    },
    msg:'success'
  }
  // const response =  request('/version/info');
  // const {code,data,msg} = response
  // const myRes = {code,msg}
  // if(data){
  //   const info = data.versionInfo
  //   const logs = data.versionLogs
  //   myRes['data'] = {
  //     versionInfo:{
  //       id:info.id,
  //       name:info.version,
  //       time:moment(info.updatedAt).format('YYYYMMDD'),
  //       desc:info.description
  //     },
  //     versionLogs:logs.map((item)=>{
  //       return item.version + item.description
  //     })
  //   }
  // }
  // return myRes
}
export async function getUpgradeInfo(){
  const response =  request('/version/env/local');
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    myRes['data'] = {
      canUpgrade:data.canUpgrade,
      isLowerVersion:data.isLower
    }
  }
  // return {
  //   code:0,
  //   data:{
  //     canUpgrade:true,
  //     isLowerVersion:true
  //   },
  //   msg:'success'
  // }
  return myRes
}
export async function upgrade(){
  const response =  request('/version/upgrade/local',{method:'POST'});
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    myRes['data'] = {}
  }
  // return {
  //   code:0,
  //   data:{
  //   },
  //   msg:'success'
  // }
  return myRes
}
export async function getProgress(){
  const response =  request('/version/upgradeProgress');
  const {code,data,msg} = response
  const myRes = {code,msg}
  if(data){
    myRes['data'] = {
      status:data.status,
      percent:data.percent
    }
  }
  // return {
  //   code:0,
  //   data:{
  //     status:'upgrading',
  //     percent:30
  //   },
  //   msg:'success'
  // }
  return myRes
}