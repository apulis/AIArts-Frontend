import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Link } from 'umi';
import { Table, Space, Button, Row, Col, Input,message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/time';
import { PAGEPARAMS } from '../../../const';
import { getCodes,deleteCode,getJupyterUrl} from '../service.js'
const CodeList = (props) => {
  const { Search } = Input;
  const [data, setData] = useState({ codeEnvs: [], total: 0 });
  console.log('data',data)
  const [loading, setLoading] = useState(true);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);// 页长
  useEffect(() => {// componentDidMount()
    renderData();
  }, [pageParams])// pageParams改变触发的componentwillUpdate()
  const renderData = async (success) => {
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
  const apiGetCodes = async (pageParams)=>{
    const obj = await getCodes(pageParams);
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
      if(data.status==='running'){
        window.open(data.accessPoint)
      }
     else{
      message.error('打开失败，请稍后重试')
     }
    }else{
      message.error(msg)
    }

  }
  const apiDeleteCode = async(id)=>{
    const obj = await deleteCode(id)
    const { code,data, msg } = obj
    if (code === 0) {
      renderData();
    } else {
      message.error(msg);
    }
  }
  const formatStatus = (status)=>{
    const map = {
      pending:'pending',
      running:'运行中',
      error:'错误',
      failed:'不可用',

    }
    return map[status]
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
      render:text=>formatStatus(text)
    },
    {
      title: '引擎类型',
      dataIndex: 'engine',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS'),
      ellipsis: true,
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
      render: (item) => {
        return (
          <Space size="middle">
            <a onClick={() => handleOpen(item)} disabled={item.status!=='running'}>打开</a>
            <a onClick={() => handleStop(item)} disabled={item.status!=='running'}>停止</a>
          </Space>
        );
      },
    },
  ];
  const handleOpen = (item) => {
    apiOpenJupyter(item.id)
  }
  const handleStop = (item) => {
    const id = item.id
    apiDeleteCode(item.id)
  }
  const handleSearch = (value) => {
    // alert(`search:${value}`)
    message.info('搜索功能，暂不支持')
  }
  const handleFresh = () => {
    renderData(()=>{message.success('刷新成功')})
  }
  const onPageParamsChange = (pageNum, pageSize) => {
    setPageParams({ pageNum, pageSize});
  };
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
            <Search
              placeholder="输入开发环境名称查询"
              onSearch={value => handleSearch(value)}
              style={{ width: 200 }}
            />
            <span>
              <Button onClick={() => handleFresh()} icon={<ReloadOutlined />} />
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
          onChange: onPageParamsChange,
          onShowSizeChange: onPageParamsChange,
        }}
        loading={loading} />
    </PageHeaderWrapper>
  )

}

export default CodeList;