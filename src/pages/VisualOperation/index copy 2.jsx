import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Button, Row, Col, Divider, Timeline, List, Skeleton, Space, Modal, Progress,Card,message } from 'antd';
import { } from '@ant-design/icons';
import { getInitData,getUpgradeInfo,getProgress,upgrade } from './service.js';
import moment from 'moment';
import { isEmptyObject } from './util'


const VisualOperation = (props) => {
  const { Title,Paragraph,Text } = Typography;
  const [initData, setInitData] = useState(null)
  const [versionInfo, setVersionInfo] = useState({})
  const [versionLogs, setVersionLogs] = useState([])
  const [progress, setProgress] = useState(50)
  const [upgradeText,setUpgradeText] = useState('一键更新')

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
    <PageHeaderWrapper>
      <Card >
        <Title level={4} style={{ marginTop: "30px" }}>版本信息</Title>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <div>
          <Row>
            <Col span="12">
              <Space align="center">
                <Text strong>版本号：</Text>
                <span>{versionInfo.name}</span>
              </Space>
            </Col>

            <Col span="12">
              <Space align="center">
                <Text strong>更新时间：</Text>
                <span>{versionInfo.time}</span>
              </Space>
            </Col>
          </Row>
          <Text strong>版本描述：</Text>
          <Row>
            <Paragraph ellipsis={{ rows: 2, symbol: 'more' }}>
              {versionInfo.desc}
            </Paragraph>
          </Row>
        </div>

        <Title level={4} style={{ marginTop: "30px" }}>本地升级</Title>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <div>
          <Button type="primary" onClick={() => { handleLocalUpgrade() }} disabled={upgradeText==='一键更新'?false:true}>
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
    </PageHeaderWrapper>
  )
}

export default VisualOperation