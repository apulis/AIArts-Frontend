import React, { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Divider, Timeline, List, Skeleton, Space, Modal, Progress, Card, message, Descriptions, Tabs  } from 'antd';
import { getInitData, getUpgradeInfo, getUpgradeLog, upgrade } from '../../service.js';
import {isEmptyString} from '../../../../utils/utils.js'
import styles from './index.less';
const { TabPane } = Tabs;
const { Paragraph } = Typography;
const VersionMngt = (props) => {
  let logTimer = null
  const { Title, Paragraph, Text } = Typography;
  const [initData, setInitData] = useState(null)
  const [versionInfo, setVersionInfo] = useState({})
  const [versionLogs, setVersionLogs] = useState([])
  const [upgradeText, setUpgradeText] = useState('一键升级')
  const [upgrading,setUpgrading] = useState(false)
  const [logs,setLogs] = useState('')
  useEffect(() => {
    renderInit()
  }, [])
  const renderInit = async () => {
    const result = await apiGetInitData()
    if (result) {
      setInitData(result)
      setVersionInfo(result.versionInfo)
      setVersionLogs(result.versionLogs)
      if(result.isUpgrading){
        upgradeManager('continue')
      }else{
        upgradeManager('init')
      }
    }
  }
  const upgradIngStatusHandler = async(logData)=>{
    switch(logData.status){
      case 'not ready':
        
        break
      case 'upgrading':
        if(!isEmptyString(logData.logs))
        setLogs(logData.logs)
        break
      case 'success':
        upgradeManager('finish')
        break
      case 'error':
        upgradeManager('error')
        break
    }
  }
  const upgradeManager = async (step)=>{
    switch(step){
      case 'init':
        setUpgradeText('一键升级')
        setUpgrading(false)
        setLogs('')
        break
      case 'check':
        const upgradeInfo = await apiGetUpgradeInfo()
        if (upgradeInfo.canUpgrade) {
          if (upgradeInfo.isLowerVersion) {
            Modal.confirm({
              title: '升级提示',
              okText: '升级',
              cancelText: '取消',
              content: "升级版本低于或等于当前版本，是否确认升级？",
              onOk() {
                upgradeManager('begin')
              },
            });
          } else {
            upgradeManager('begin')
          }
        }
        else {
          Modal.error({
            title: '升级提示',
            content: '经检测，暂不支持升级',
          });
        }
        break
      case 'begin':
        const result = await apiUpgrade()
        if(result){
          setUpgradeText('开始升级')
          logTimer = setInterval(upgradeManager.bind(this,'upgrading'),1000)
        }
        break
      case 'continue':
        if(logTimer) clearInterval(logTimer)
        logTimer = setInterval(upgradeManager.bind(this,'upgrading'),1000)
        break
      case 'upgrading':
        if(!upgrading) setUpgrading(true)
        if(upgradeText!=='正在升级') setUpgradeText('正在升级')
        const logData = await apiGetUpgradeLog()
        if(logData){
          upgradIngStatusHandler(logData)
        }
        break
      case 'finish':
        setUpgradeText('升级成功')
        if(logTimer)clearInterval(logTimer)
        message.success('升级成功')
        location.reload()
        break
      case 'error':
        setUpgradeText('升级失败')
        if(logTimer)clearInterval(logTimer)
        message.error('升级失败')
        break
    }
  }
  const apiGetInitData = async () => {
    const { code, data, msg } = await getInitData()
    let return_data = null
    if (code === 0) {
      return_data = data
    } else {
      message.error(msg);
    }
    return return_data
  }
  const apiGetUpgradeInfo = async () => {
    const { code, data, msg } = await getUpgradeInfo()
    let return_data = null
    if (code === 0) {
      return_data = data
    } else {
      message.error(msg);
    }
    return return_data
  }
  const apiUpgrade = async () => {
    const { code, data, msg } = await upgrade()
    if (code === 0) {
      return true // todo 此处应该修改，响应是有效的。
    } else {
      message.error(msg);
      return false
    }
  }
  const apiGetUpgradeLog = async()=>{
    const { code, data, msg } = await getUpgradeLog()
    let return_data = null
    if (code === 0) {
      return_data = data
    } else {
      message.error(msg);
    }
    return return_data
  }
  return (
    <Card >
      <Descriptions title="版本信息" bordered>
        <Descriptions.Item label="版本号">{versionInfo.name}</Descriptions.Item>
        <Descriptions.Item label="操作者" span={1}>{versionInfo.creator}</Descriptions.Item>
        <Descriptions.Item label="安装时间" span={1}>{versionInfo.time}</Descriptions.Item>
        <Descriptions.Item label="版本描述" span={3}>
          {versionInfo.desc}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="本地升级" style={{ marginTop: "30px" }}>
      </Descriptions>
      <div>
        <Button type="primary" onClick={() => { upgradeManager('check') }} disabled={upgradeText === '一键升级' ? false : true}>
          {upgradeText}
        </Button>
        {upgrading && <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}>
          {logs}
        </Paragraph>}
      </div>
      <Title level={4} style={{ marginTop: "30px" }}>安装日志</Title>
      <Divider style={{ borderColor: '#cdcdcd' }} />
      <div><Timeline>
        {versionLogs.map(
          (item) => (<Timeline.Item>{item}</Timeline.Item>)
        )}
      </Timeline></div>
    </Card>
  )
}

export default VersionMngt