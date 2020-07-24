import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Typography, Button, Row, Col, Divider, Timeline, List, Skeleton, Space, Modal } from 'antd';
import { } from '@ant-design/icons';
import { getInitData,getVersionDetail } from './service.js';
import moment from 'moment';
import {isEmptyObject} from './util'


const VisualOperation = (props) => {
  const { Title } = Typography;
  const { Paragraph } = Typography;
  const [initData, setInitData] = useState(null)
  const [versionInfo, setVersionInfo] = useState({})// 踩坑：对象初始化为null，导致不可用
  const [versionList, setVersionList] = useState([]) // 原则：组件的默认数据不要设为初始状态
  const [versionLogs, setVersionLogs] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [listInitLoading, setListInitLoading] = useState(false)
  const [modalData,setModalData] = useState({})
  useEffect(() => {
    renderInit()
  }, [])
  // useEffect(() => {
  //   setListInitLoading(versionList ? false : true)
  // }, [versionList])
  useEffect(()=>{
    setModalVisible(isEmptyObject(modalData)?false:true)
  },[modalData])
  const renderInit = async () => {
    setListInitLoading(true)
    const result = await apiGetInitData()
    if (result) {
      setInitData(result)
      setVersionInfo(result.versionInfo)
      setVersionList(result.versionList)
      setVersionLogs(result.versionLogs)
    }
    setListInitLoading(false)// 不严谨但可用
  }
  const renderModal = async (id)=>{
    const result = await apiGetVersionDetail(id)
    if (result) {
      setModalData(result)
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
  const apiGetVersionDetail = async (id)=>{
    const { code, data, msg } = await getVersionDetail(id)
    let return_data = null
    if (code === 0) {
      return_data = data
    } else {
      message.error(msg);
    }
    return return_data
  }
  const handleLoadMore = () => {
    alert('加载更多')
  }
  const handleView = (id) => {
    renderModal(id)
  }
  const handleRemoteUpgrade = (item) => {
    console.log(item)
  }
  const handleLocalUpgrade = () => {
    alert('一键更新')
  }
  const handleModalClose = () => {
    setModalData({})
  }
  return (
    <PageHeaderWrapper>
      <div >
        <Title level={4} style={{ marginTop: "30px" }}>版本信息</Title>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <div>
          <Row>
            <Col span="12">
              <Space align="center">
                <span>版本号：</span>
                <span>{versionInfo.name}</span>
              </Space>
            </Col>

            <Col span="12">
              <Space align="center">
                <span>更新时间：</span>
                <span>{versionInfo.time}</span>
              </Space>
            </Col>
          </Row>
          <span>版本描述：</span>
          <Row>
            <Paragraph ellipsis={{ rows: 2, symbol: 'more' }}>
              {versionInfo.desc}
            </Paragraph>
          </Row>
        </div>

        <Title level={4} style={{ marginTop: "30px" }}>在线升级</Title>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <div>
          <List
            className="demo-loadmore-list"
            loading={listInitLoading}
            itemLayout="horizontal"
            loadMore={handleLoadMore}
            dataSource={versionList}
            renderItem={item => (
              <List.Item
              // todo 传过来的item.id为undedfined
            actions={[<Button type="primary" onClick={() => handleView(item.id)}>查看</Button>, <Button type="primary" onClick={() => handleRemoteUpgrade(item.id)}>升级</Button>]}
              >
                  <List.Item.Meta
                    title={item.version}
                  // description={item.desc}
                  />
                  {/* <div>{item.time}</div> */}
              </List.Item>
            )}
          />
        </div>

        <Title level={4} style={{ marginTop: "30px" }}>本地升级</Title>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <div>
          <Button type="primary" onClick={() => { handleLocalUpgrade }}>
            一键升级
                </Button>
        </div>
        <Title level={4} style={{ marginTop: "30px" }}>更新日志</Title>
        <Divider style={{ borderColor: '#cdcdcd' }} />
        <div><Timeline>
          {versionLogs.map(
            (item) => (<Timeline.Item>{item}</Timeline.Item>)
          )}
          {/* 踩坑：箭头函数返回项 */}
        </Timeline></div>
       <Modal
            title={modalData.name}
            visible={modalVisible}
            footer={(<Button type="primary" onClick = {handleModalClose}>确定</Button>)}
            onCancel={handleModalClose}
          >
            <p>{modalData.id}</p>
            <p>{modalData.time}</p>
          <p>{modalData.desc}</p>
          </Modal>
      </div>
    </PageHeaderWrapper>
  )
}

export default VisualOperation