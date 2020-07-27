import React, { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, Divider, Timeline, List, Skeleton, Space, Modal, Progress, Card, message, Descriptions,Tabs } from 'antd';
import { getInitData, getUpgradeInfo, getProgress, upgrade } from '../../service.js';
const { TabPane } = Tabs;

const VersionMngt = (props) => {
  const { Title, Paragraph, Text } = Typography;
  const [initData, setInitData] = useState(null)
  const [versionInfo, setVersionInfo] = useState({})
  const [versionLogs, setVersionLogs] = useState([])
  const [progress, setProgress] = useState(50)
  const [upgradeText, setUpgradeText] = useState('一键更新')

  useEffect(() => {
    renderInit()
  }, [])
  const renderInit = async () => {
    const result = await apiGetInitData()
    if (result) {
      setInitData(result)
      setVersionInfo(result.versionInfo)
      setVersionLogs(result.versionLogs)
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
  const handleLocalUpgrade = () => {
    setUpgradeText('更新中')
  }
  return (
      <Card >
        <Descriptions title="版本信息" bordered>
          <Descriptions.Item label="版本号">{versionInfo.name}</Descriptions.Item>
          <Descriptions.Item label="操作者" span={1}>{versionInfo.creator}</Descriptions.Item>
          <Descriptions.Item label="更新时间" span={1}>{versionInfo.time}</Descriptions.Item>
          <Descriptions.Item label="版本描述" span={3}>
            {versionInfo.desc}
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="本地升级" style={{ marginTop: "30px" }}>
        </Descriptions>
        <div>
          <Button type="primary" onClick={() => { handleLocalUpgrade() }} disabled={upgradeText === '一键更新' ? false : true}>
            {upgradeText}
          </Button>
          <Progress percent={progress}></Progress>
        </div>
        <Title level={4} style={{ marginTop: "30px" }}>更新日志</Title>
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