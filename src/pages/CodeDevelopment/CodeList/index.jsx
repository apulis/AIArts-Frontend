import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Link } from 'umi';
import { Table, Space, Button, Row, Col, Input,message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { formatDate } from '@/utils/time';
import { PAGEPARAMS } from '../../../const';
import { getCodes } from '../service.js'
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
    const { page, pageSize } = pageParams;
    const obj = await getCodes(page, pageSize);
    const { code, data, msg, total } = obj
    if (code === 0) {
      setCodes({
        data: data,
        total: total,
      });
    } else {
      message.error(msg);
    }
    setLoading(false);
  };
  console.log(codes)
  const columns = [
    {
      title: '开发环境名称',
      dataIndex: 'devName',
      key: 'devName',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
    },
    {
      title: '引擎类型',
      dataIndex: 'engineType',
      key: 'engineType',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS'),
      ellipsis: true,
    },
    {
      title: '代码存储目录',
      dataIndex: 'codeStorePath',
      key: 'codeStorePath',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc',
      ellipsis: true,
    },
    {
      title: '操作',
      render: (item) => {
        return (
          <Space size="middle">
            <a onClick={() => onOpen(item)}>打开</a>
            <a onClick={() => onDelete(item)}>删除</a>
          </Space>
        );
      },
    },
  ];
  const onOpen = (item) => {
    alert('open')
    console.log('open', item)
  }
  const onDelete = (item) => {
    alert('delete')
    console.log('delete', item)
  }
  const onSearch = (value) => {
    alert(value)
  }
  const onRefreshTable = () => {
    renderData()
    alert('flash Data')
  }
  const onPageParamsChange = (page, size) => {
    setPageParams({ page: page, pageSize: size });
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
              placeholder="输入开发名称查询"
              onSearch={value => onSearch(value)}
              style={{ width: 200 }}
            />
            <span>
              <Button onClick={() => onRefreshTable()} icon={<ReloadOutlined />} />
            </span>
          </div>
        </Col>
      </Row>
      <Table
        dataSource={codes.data.list}
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
      {/* <h2>s</h2> */}
    </PageHeaderWrapper>
  )

}

export default CodeList;