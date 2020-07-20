import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Row, Col } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { history } from 'umi';

const { Search } = Input;
const { Option } = Select;

const ParamsManage = () => {
  const handleCreateTrainJob = (item) => {
    history.push('submit')
  };
  const handleEdit = (id) => {
    history.push(`createJobWithParam?id=${id}`);
  };
  const handleDelete = (id) => {

  };
  const columns = [
    { title: '参数配置名称', dataIndex: 'configName', key: 'configName' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '引擎类型', dataIndex: 'engineType', key: 'engineType' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '描述', dataIndex: 'discription', key: 'discription' },
    {
      title: '操作',
      render: item => {
        const { id } = item;
        return (
          <>
            <a onClick={() => handleCreateTrainJob(item)}>创建训练作业</a>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(id)}>编辑</a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>删除</a>
          </>
        )
      },
    },
  ];
  const data = [
    {
      id: 1,
      configName: 'train_job_config_001',
      type: '训练',
      engineType: 'tensorflow , tf-1.8.0-py2.7',
      createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
      description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
    },
    {
      id: 2,
      configName: 'train_job_config_001',
      type: '训练',
      engineType: 'tensorflow , tf-1.8.0-py2.7',
      createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
      description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
    },
  ];
  const searchList = () => {

  };
  const getParamsList = () => {

  };
  const handleTypeChange = (value) => {
    console.log(`selected ${value}`);
  };

  return (
    <Row gutter={[0, 16]} justify="end">
      <Col>
        <Select defaultValue="all" style={{ width: 200 }} onChange={handleTypeChange}>
          <Option value="all">全部</Option>
          <Option value="train">训练</Option>
          <Option value="inference">推理</Option>
        </Select>
        <Search style={{ width: '200px', marginLeft: '20px' }} placeholder="输入参数配置名称" onSearch={searchList} />
        <Button style={{ marginLeft: '20px' }} icon={<SyncOutlined />} onClick={() => getParamsList()}></Button>
      </Col>
      <Col span={24}>
        <Table
          columns={columns}
          expandable={{
            expandedRowRender: record => <p style={{ margin: 0 }}>{record.description}</p>,
            rowExpandable: record => record.name !== 'Not Expandable',
          }}
          dataSource={data}
        />
      </Col>
    </Row>
  )
}

export default ParamsManage