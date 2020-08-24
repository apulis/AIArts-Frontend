import React, { useState, useEffect, useRef } from 'react';
import { history } from 'umi';
import { Table, Select, Space, Button, Row, Col, Input, message, Modal } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { getCodes, stopCode,deleteCode, getJupyterUrl, getCodeCount } from '../../service.js';
import moment from 'moment';
import { isEmptyString } from '../../util.js'
import CodeUpload from '../UpLoad'
import { statusMap, canOpenStatus, canStopStatus, canUploadStatus, sortColumnMap, sortTextMap, pageObj } from '../../serviceController.js'
import { getNameFromDockerImage } from '@/utils/reg.js';

const CodeList = (props) => {
  const { Search } = Input;
  const { Option } = Select;
  const searchRef = useRef(null)
  const [codes, setCodes] = useState({ codeEnvs: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [pageParams, setPageParams] = useState(pageObj);// 页长
  const [statusSearchArr, setStatusSearchArr] = useState([])
  const [curStatus, setCurStatus] = useState('')
  const [searchObj, setSearchObj] = useState({})
  const [modalFlag, setModalFlag] = useState(false);
  const [modalData, setModalData] = useState({})
  const [sortInfo, setSortInfo] = useState({
    orderBy: '',
    order: ''
  })
  useEffect(() => {
    renderStatusSelect()
  }, [])

  useEffect(() => {
    renderTable(pageParams);
  }, [pageParams, sortInfo, curStatus])

  useEffect(() => {
    if (curStatus != '') {
      renderTable(pageObj);
      setPageParams(pageObj);
    }
  }, [curStatus])

  useEffect(() => {
    if (searchObj.type != undefined) {
      const type = searchObj.type
      if (type === 'search') {
        renderTable(pageParams);
      } else if (type === 'fresh') {
        renderTable(pageParams, () => { message.success('刷新成功') })
      }
    }
  }
    , [searchObj])


  const renderStatusSelect = async () => {
    // todo
    const apiData = await apiGetCodeCount()
    if (apiData) {
      setStatusSearchArr(apiData)
      // 只有第一次会重新赋值
      if(curStatus==='')setCurStatus(apiData[0].status)
    }
  }
  const renderTable = async (pageParams, success) => {
    setLoading(true)
    const apiData = await apiGetCodes(pageParams)
    if (apiData) {
      setCodes({
        codeEnvs: apiData.CodeEnvs,
        total: apiData.total
      })
      if (success) {
        success()
      }
    }
    setLoading(false);
  };
  const apiGetCodeCount = async () => {
    const obj = await getCodeCount()
    const { code, data, msg } = obj
    if (code === 0) {
      return data
    } else {
      return null
    }
  }
  const apiGetCodes = async (pageParams) => {
    const params = { ...pageParams }
    params['status'] = isEmptyString(curStatus) ? 'all' : curStatus
    if (!isEmptyString(searchObj.word)) {
      params['searchWord'] = searchObj.word
    }
    if (sortInfo.order && !isEmptyString(sortInfo.orderBy) && !isEmptyString(sortInfo.order)) {
      params['orderBy'] = sortColumnMap[sortInfo.orderBy]
      params['order'] = sortTextMap[sortInfo.order]
    }
    const obj = await getCodes(params);
    const { code, data, msg } = obj
    if (code === 0) {
      return data
    } else {
      return null
    }
  }
  const apiOpenJupyter = async (id) => {
    const { code, data, msg } = await getJupyterUrl(id)
    if (code === 0) {
      if (data.name === 'ipython' && data.status === 'running' && data.accessPoint) {
        window.open(data.accessPoint)
      }
      else {
        message.info('服务正在准备中，请稍候再试')
      }
    }
  }
  const apiStopCode = async (id) => {
    const obj = await stopCode(id)
    const { code, data, msg } = obj
    if (code === 0) {
      renderTable(pageParams);
      message.success('停止成功');
    }
  }
  const apiDeleteCode = async (id) => {
    const obj = await deleteCode(id)
    const { code,data, msg } = obj
    if (code === 0) {
      if(codes.codeEnvs.length ==1 && pageParams.pageNum > 1){
        renderTable({ ...pageParams, pageNum: pageParams.pageNum - 1 });
        setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
      }
      else{
        renderTable(pageParams)
      }
      message.success('删除成功');
    }
  }
  const handleOpen = (item) => {
    apiOpenJupyter(item.id)
  }
  const handleStop = (item) => {
    const id = item.id
    apiStopCode(item.id)
  }
  const handleDelete = (item) => {
    const id = item.id
    const status = item.status
    if(canStopStatus.has(status)){
      Modal.warning({
        title: '删除提示',
        content: '请先停止该任务',
        okText:'确定'
      });
    }else{
      apiDeleteCode(item.id)
    }
  }
  const handleSelectChange = (selectStatus) => {
    setCurStatus(selectStatus)
  }
  const handleSearch = (searchWord) => {
    setSearchObj({ type: 'search', word: searchWord })
  }
  const handleFresh = () => {
    const value = searchRef.current.state.value
    setSearchObj({ type: 'fresh', word: value })
  }
  const handlePageParamsChange = (pageNum, pageSize) => {
    setPageParams({ pageNum, pageSize });
  };
  const handleOpenModal = (codeItem) => {
    setModalData(codeItem)
    setModalFlag(true)
  }
  const handleSortChange = (pagination, filters, sorter) => {
    const { field: orderBy, order } = sorter
    setSortInfo({ orderBy, order });
  }
  const handleCreateCodeDev = () => {
    history.push('/codeDevelopment/add')
  }
  const columns = [
    {
      title: '开发环境名称',
      dataIndex: 'name',
      ellipsis: true,
      sorter: true,
      sortOrder: sortInfo.orderBy === 'name' && sortInfo['order'],// name与createTime非复合排序，各自独立排序
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      render: status => statusMap[status]?.local,
    },
    {
      title: '引擎类型',
      dataIndex: 'engine',
      ellipsis: true,
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      sorter: true,
      sortOrder: sortInfo.orderBy === 'createTime' && sortInfo['order'],
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
            <a onClick={() => handleOpenModal(codeItem)} disabled={!canUploadStatus.has(codeItem.status)}>上传代码</a>
            <a onClick={() => handleStop(codeItem)} disabled={!canStopStatus.has(codeItem.status)} style={canStopStatus.has(codeItem.status) ? { color: 'red' } : {}}>停止</a>
            <a onClick={() => handleDelete(codeItem)} style={{color:'red'}}>删除</a>
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <Row style={{ marginBottom: "20px" }}>
        <Col span={12}>
          <div style={{ float: "left" }}>
            <Button type='primary' onClick={() => { handleCreateCodeDev() }}>创建开发环境</Button>
          </div>
        </Col>
        <Col span={12}>
          <div style={{ float: "right" }}>
            <div style={{ width: '200px', display: 'inline-block' }}>
              <Select value={curStatus} style={{ width: 'calc(100% - 8px)', margin: '0 8px 0 0' }} onChange={(item) => handleSelectChange(item)}>
                {
                  statusSearchArr.map((item, key) => (
                    <Option key={key} value={item.status}>{item.desc}</Option>
                  ))
                }
              </Select>
            </div>
            <Search
              placeholder="输入开发环境名称查询"
              ref={searchRef}
              onSearch={value => handleSearch(value)}
              style={{ width: 210 }}
              enterButton
            />
            <span>
              <Button onClick={() => handleFresh()} icon={<SyncOutlined />} style={{ marginLeft: '3px' }} />
            </span>
          </div>
        </Col>
      </Row>
      <Table
        dataSource={codes.codeEnvs}
        columns={columns}
        onChange={handleSortChange}
        rowKey={r => r.id}
        pagination={{
          total: codes.total,
          showTotal: (total) => `总共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: handlePageParamsChange,
          onShowSizeChange: handlePageParamsChange,
          current: pageParams.pageNum,
        }}
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
          <CodeUpload modalData={modalData}></CodeUpload>
        </Modal>
      )}
    </>
  )

}

export default CodeList;