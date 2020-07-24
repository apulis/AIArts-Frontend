import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Link } from 'umi';
import { Table, Select,Space, Button, Row, Col, Input,message,Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { PAGEPARAMS } from '@/utils/const';
import { getCodes,deleteCode,getJupyterUrl,getCodeCount} from '../service.js';
import moment from 'moment';
import { displayName } from 'react-fittext';
import {isEmptyString} from '../util.js'
import UploadCode from './components/UploadCode'

const CodeList = (props) => {
  const { Search } = Input;
  const { Option } = Select;
  const statusMap = {
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
  const canOpenStatus = new Set(['running'])
  const canStopStatus = new Set(['unapproved','queued','scheduling','running'])
  const [data, setData] = useState({ codeEnvs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);// 页长
  const [statusSearchArr,setStatusSearchArr] = useState([])
  const [curStatus,setCurStatus] = useState('')
  const [searchName,setSearchName] = useState('')
  const [modalFlag, setModalFlag] = useState(false);
  const [modalData,setModalData] = useState({})
  useEffect(()=>{
    renderStatusSelect()
  },[])
  useEffect(() => {// componentDidMount()
    renderTable();
  }, [pageParams])// pageParams改变触发的componentwillUpdate()
  
  const renderStatusSelect = async ()=>{
    // todo
    const apiData = await apiGetCodeCount()
    if(apiData){
      setStatusSearchArr(apiData.counts)
      setCurStatus(apiData.counts[0])
    }
  }
  const renderTable = async (success) => {
    setLoading(true)
    const apiData = await apiGetCodes(pageParams)
    if(apiData){
      setData({
        codeEnvs:apiData.CodeEnvs,
        total:apiData.total
      })
      if(success){
        success()
      }
    }
    setLoading(false);
  };
  const apiGetCodeCount = async()=>{
    const obj = await getCodeCount()
    const {code,data,msg} = obj
    if (code === 0) {
      return data
    } else {
      message.error(msg);
      return null
    }
  }
  const apiGetCodes = async (pageParams)=>{
    const params = {...pageParams}
    params['status'] = isEmptyString(curStatus)?'all':curStatus
    if(!isEmptyString(searchName)){
      params['searchName'] = searchName
    }
    const obj = await getCodes(params);
    const { code, data, msg } = obj
    if (code === 0) {
      return data
    } else {
      message.error(msg);
      return null
    }
  }
  const apiOpenJupyter = async (id)=>{
    const {code,data,msg} = await getJupyterUrl(id)
    if(code===0){
      if(data.name==='ipython' && data.status==='running' && data.accessPoint){
        window.open(data.accessPoint)
      }
     else{
      message.info('服务正在准备中，请稍候再试')
     }
    }else{
      message.error(msg)
    }

  }
  const apiDeleteCode = async(id)=>{
    const obj = await deleteCode(id)
    const { code,data, msg } = obj
    if (code === 0) {
      renderTable();
      message.success('停止成功');
    } else {
      message.error(msg);
    }
  }
  const handleOpen = (item) => {
    apiOpenJupyter(item.id)
  }
  const handleStop = (item) => {
    const id = item.id
    apiDeleteCode(item.id)
  }
  const handleSelectChange = (selectStatus)=>{
    setCurStatus(selectStatus)
    renderTable()
  }
  const handleSearch = async (searchName) => {
    setSearchName(searchName)
    renderTable()
  }
  const handleFresh = () => {
    renderTable(()=>{message.success('刷新成功')})
  }
  const handlePageParamsChange = (pageNum, pageSize) => {
    setPageParams({ pageNum, pageSize});
  };
  const handleOpenModal = (codeItem)=>{
    setModalData(codeItem)
    setModalFlag(true)
  }
  const columns = [
    {
      title: '开发环境名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      render:status=>statusMap[status].local,
      sorter:{
        compare:(item1,item2) =>statusMap[item1.status].priority-statusMap[item2.status].priority,
        multiple:2
      }
    },
    {
      title: '引擎类型',
      dataIndex: 'engine',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      sorter:{
        compare:(item1,item2) =>moment(item1.createTime).valueOf()-moment(item2.createTime).valueOf(),
        multiple:1
      }
    },
    {
      title: '代码存储目录',
      dataIndex: 'codePath',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      ellipsis: true,
    },
    {
      title: '操作',
      render: (codeItem) => {
        return (
          <Space size="middle">
            <a onClick={() => handleOpen(codeItem)} disabled={!canOpenStatus.has(codeItem.status)}>打开</a>
            <a onClick={() => handleStop(codeItem)} disabled={!canStopStatus.has(codeItem.status)}>停止</a>
            <a onClick={() => handleOpenModal(codeItem)}>上传代码</a>
          </Space>
        );
      },
    },
  ];
  return (
    <PageHeaderWrapper>
      <Row style={{marginBottom:"20px"}}>
        <Col span={12}>
          <div style={{ float: "left"}}>
            <Link to="/CodeCreate">
              <Button href="">创建开发环境</Button>
            </Link>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ float: "right" }}>
            <div style={{width:'200px',display:'inline-block'}}>
            <Select value={curStatus} style={{width:'calc(100% - 8px)',margin:'0 8px 0 0'}} onChange ={(item)=>handleSelectChange(item)}>
              {
                statusSearchArr.map((item) => (
                  <Option value={item}>{item}</Option>
                ))
              }
            </Select>
            </div>
            <Search
              placeholder="输入开发环境名称查询"
              onSearch={value => handleSearch(value)}
              style={{ width: 200 }}
            />
            <span>
              <Button onClick={() => handleFresh()} icon={<SyncOutlined />} />
            </span>
          </div>
        </Col>
      </Row>
      <Table
        dataSource={data.codeEnvs}
        columns={columns}
        rowKey={(r, i) => `${i}`}
        pagination={{
          total: data.total,
          showTotal: (total) => `总共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: handlePageParamsChange,
          onShowSizeChange: handlePageParamsChange,
        }}
        pageSize={false}
        loading={loading} />
        {modalFlag && (
        <Modal
          title="上传代码"
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={480}
          footer={[
            <Button onClick={() => setModalFlag(false)}>关闭</Button>,
          ]}
        >
          <UploadCode modalData={modalData}></UploadCode>
        </Modal>
      )}
    </PageHeaderWrapper>
  )

}

export default CodeList;