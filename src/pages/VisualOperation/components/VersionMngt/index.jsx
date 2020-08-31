import React, { useState, useEffect, forwardRef } from 'react';
import { Typography, Button, Row, Col, Divider, Timeline, List, Skeleton, Space, Modal, Progress, Card, message, Descriptions, Tabs } from 'antd';
import { throttle } from 'lodash'
import { getInitData, getUpgradeInfo, getUpgradeLog, upgrade } from '../../service.js';
import { isEmptyString } from '../../../../utils/utils.js'
import styles from './index.less';
const { TabPane } = Tabs;
const { Paragraph } = Typography;
let logTimer = null
const VersionMngt = (props) => {
  // let logTimer = null // 放这访问不到
  const { Title, Paragraph, Text } = Typography;
  const [initData, setInitData] = useState({})
  const [vHistoryNum, setVHistoryNum] = useState(10)
  const [versionInfo, setVersionInfo] = useState({})
  const [versionLogs, setVersionLogs] = useState([])
  const [upgradeText, setUpgradeText] = useState('一键升级')
  const [upgrading, setUpgrading] = useState(false)
  const [logs, setLogs] = useState('')
  const [historyVisible, setHistoryVisible] = useState(false)
  const [checkingFlag, setCheckingFlag] = useState(false)
  useEffect(() => {
    renderInit()
    return () => {
      clearInterval(logTimer)
    }
  }, [])
  const renderInit = async () => {
    const result = await apiGetInitData()
    if (result) {
      setInitData(result)
      setVersionInfo(result.versionInfo)
      setVersionLogs(result.versionLogs.slice(0, vHistoryNum))
      if (result.isUpgrading) {
        upgradeManager('continue')
      } else {
        // upgradeManager('init')
        setUpgradeText('一键升级')
        setUpgrading(false)
        setLogs('')
      }
    }
  }
  const upgradIngStatusHandler = async (logData) => {
    switch (logData.status) {
      case 'not ready':
        upgradeManager('finish')
        break
      case 'upgrading':
        if (!isEmptyString(logData.logs))
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
  const upgradeManager = async (step) => {
    switch (step) {
      case 'init':
        renderInit()
        break
      case 'check':
        setCheckingFlag(true)
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
            content: '没有检测到升级文件',
          });
        }
        setCheckingFlag(false)
        break
      case 'begin':
        const result = await apiUpgrade()
        if (result) {
          setUpgradeText('开始升级')
          logTimer = setInterval(upgradeManager.bind(this, 'upgrading'), 1000)
        }
        break
      case 'continue':
        if (logTimer) clearInterval(logTimer)
        logTimer = setInterval(upgradeManager.bind(this, 'upgrading'), 1000)
        break
      case 'upgrading':
        if (!upgrading) setUpgrading(true)
        if (upgradeText !== '正在升级') setUpgradeText('正在升级')
        const logData = await apiGetUpgradeLog()
        if (logData) {
          upgradIngStatusHandler(logData)
        }
        break
      case 'finish':
        if (upgradeText !== '升级成功') setUpgradeText('升级成功')
        if (logTimer) clearInterval(logTimer)
        setTimeout(() => {
          message.success('升级成功，版本数据已更新')
          upgradeManager('init')
        }, 1000)

        break
      case 'error':
        setUpgradeText('升级失败')
        if (logTimer) clearInterval(logTimer)
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
      message.error('请求异常');
    }
    return return_data
  }
  const apiGetUpgradeInfo = async () => {
    const { code, data, msg } = await getUpgradeInfo()
    let return_data = null
    if (code === 0) {
      return_data = data
    } else {
      message.error('请求异常');
    }
    return return_data
  }
  const apiUpgrade = async () => {
    const { code, data, msg } = await upgrade()
    switch (code) {
      case 0:
        return true
      case 30501:
        Modal.error({
          title: '升级提示',
          content: '目标文件不存在，升级失败',
        });
        break
      case 30502:
        Modal.error({
          title: '升级提示',
          content: '文件读取错误',
        });
        break
      case 30503:
        Modal.error({
          title: '升级提示',
          content: '正在升级，请等待升级结束',
        });
        break
    }
    return false
  }
  const apiGetUpgradeLog = async () => {
    const { code, data, msg } = await getUpgradeLog()
    let return_data = null
    if (code === 0) {
      return_data = data
    } else {
      upgradeManager('error')
    }
    return return_data
  }
  const handleShowHistoryModal = () => {
    setHistoryVisible(true)
  }
  const handleLoadMoreHistory = async () => {
    const len = initData.versionLogs.length
    if (len > vHistoryNum) {
      const newNum = len <= vHistoryNum + 10 ? len : vHistoryNum + 10
      setVersionLogs(initData.versionLogs.slice(0, newNum))
      setVHistoryNum(newNum)
    }
    else {
      Modal.info({
        title: '提示',
        content: (
          <div>
            <p>没有更多历史记录</p>
          </div>
        )
      });
    }
  }

  return (
    <Card >
      <Button type='primary' onClick={() => { handleShowHistoryModal() }} style={{ position: 'absolute', right: '0px', marginRight: '24px' }}>
        升级历史
      </Button>
      <Descriptions title="版本信息" bordered>
        <Descriptions.Item label="版本号">{versionInfo.name}</Descriptions.Item>
        <Descriptions.Item label="操作人" span={1}>{versionInfo.creator}</Descriptions.Item>
        <Descriptions.Item label="安装时间" span={1}>{versionInfo.time}</Descriptions.Item>
        <Descriptions.Item label="版本描述" span={3}>
          {versionInfo.desc}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions title="本地升级" style={{ marginTop: "30px" }}>
      </Descriptions>
      <div>
        <Button type="primary" onClick={() => { if (!checkingFlag) upgradeManager('check') }} disabled={upgradeText === '一键升级' ? false : true}>
          {upgradeText}
        </Button>
        {upgrading && <div style={{ height: '120px', marginTop: '14px' }}>
          <Paragraph ellipsis={{ rows: 5 }}>
            {logs}
          </Paragraph>
        </div>}
      </div>
      {historyVisible && <Modal
        title="升级历史"
        visible={historyVisible}
        onCancel={() => { setHistoryVisible(false) }}
        maskClosable={false}
        footer={[
          <Button onClick={() => { setHistoryVisible(false) }}>关闭</Button>,
        ]}
      >
        <div style={{ height: '320px', overflowY: 'scroll', paddingTop: '10px', position: 'relative' }}><Timeline>
          {versionLogs.map(
            (item, key) => (<Timeline.Item key={key}>{item}</Timeline.Item>)
          )}
        </Timeline>
          <div style={{ display: 'flex', justifyContent: 'center', position: 'absolute', width: '100%', bottom: '10px' }}>
            <Button type='primary' onClick={() => { handleLoadMoreHistory() }}>
              更多历史
            </Button>
          </div>
        </div>
      </Modal>}
    </Card>
  )
}

export default VersionMngt