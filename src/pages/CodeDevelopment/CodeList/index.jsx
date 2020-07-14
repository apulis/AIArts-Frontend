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
  const [codes, setCodes] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);// 页长
  useEffect(() => {// componentDidMount()
    renderData();
  }, [pageParams])// pageParams改变触发的componentwillUpdate()
  const renderData = async () => {
    setLoading(true);
    apiGetCodes(pageParams)
    setLoading(false);
  };
  const apiGetCodes = async (pageParams)=>{
    const obj = await getCodes(pageParams);
    const { code, data, msg } = obj
    if (code === 0) {
      setCodes({
        data: data,
        total: data.total,
      });
    } else {
      message.error(msg);
    }
  }
  const apiOpenJupyter = async ()=>{
    const {code,data,msg} = await getJupyterUrl(id)
    if(code===0){
      const endpoints = data.endpoints
      let url = ''
      let flag = false
      endpoints.forEach((obj)=>{
        if(!flag && obj.name==='ipython' && obj.status==='running'){
          flag = true
          url = domain
        }
      })
      if(flag){
        window.open(url)
      }else{
        message.info('跳转失败，请稍后再试')
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
            <a onClick={() => handleOpen(item)}>打开</a>
            <a onClick={() => handleDelete(item)}>删除</a>
          </Space>
        );
      },
    },
  ];
  const handleOpen = (item) => {
    apiOpenJupyter(item.id)
  }
  const handleDelete = (item) => {
    const id = item.id
    apiDeleteCode(item.id)
  }
  const handleSearch = (value) => {
    alert(`search:${value}`)
  }
  const handleFresh = () => {
    renderData()
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
        dataSource={codes.data.CodeEnvs}
        columns={columns}
        rowKey={(r, i) => `${i}`}
        pagination={{
          total: codes.data.total,
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