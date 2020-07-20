import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Row, Col, Descriptions, Card } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';


const { Search } = Input;
const { Option } = Select;

const ParamsManage = () => {

  const ExpandDetail = (props) => {
    const record = props.record;
    return (
      <Descriptions>
        <Descriptions.Item label="参数配置名称">{record.configName}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{record.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点数">{record.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{record.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="运行参数">{record.arguments}</Descriptions.Item>
        <Descriptions.Item label="引擎类型">{record.engine}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{record.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{record.deviceType}</Descriptions.Item>
        <Descriptions.Item label="描述">{record.description}</Descriptions.Item>
      </Descriptions>
    );
  };

  const handleCreateTrainJob = (item) => {
    const path = {
      pathname: 'createJobWithParam',
      state: item,
      type: 'createWithParam',
    };
    history.push(path);
  };
  const handleEdit = (item) => {
    const path = {
      pathname: 'createJobWithParam',
      state: item,
      type: 'editParam',
    };
    history.push(path);
  };

  const handleDelete = (id) => {

  };

  const omitText = (text, length) => {
    if (text == null) {
      return "";
    }
    if (text.length > length) {
      return text.substring(0, length - 1) + "...";
    }
    return text;
  };

  const columns = [
    { title: '参数配置名称', dataIndex: 'configName', key: 'configName' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '引擎类型', dataIndex: 'engine', key: 'engine' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '描述',
      width: '25%',
      render: item => {
        const { description } = item;
        return omitText(description, 30);
      }
    },
    {
      title: '操作',
      render: item => {
        const { id } = item;
        return (
          <>
            <a onClick={() => handleCreateTrainJob(item)}>创建训练作业</a>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(item)}>编辑</a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>删除</a>
          </>
        );
      },
    },
  ];
  const data = [
    {
      key: 1,
      id: 1,
      configName: 'train_job_config_001',
      type: '训练',
      engine: 'tensorflow , tf-1.8.0-py2.7',
      createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
      description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
      startupFile: '/start.sh',
      deviceNum: 3,
      datasetPath: 'train.csv',
      arguments: [
        {
          key: 'learning_rate',
          value: 0.01,
          createTime: 4242142
        },
        {
          key: 'epoch',
          value: 20,
          createTime: 4242442
        },
        {
          key: 'dropout',
          value: 0.5,
          createTime: 4242443
        },
      ],
      engine: 'tensorflow',
      codePath: '/home/code/',
      deviceType: '1核 | 16GB | 1*AI加速卡	'
    },
    {
      key: 2,
      id: 2,
      configName: 'train_job_config_001',
      type: '训练',
      engine: 'tensorflow , tf-1.8.0-py2.7',
      createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
      description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
      startupFile: '/start.sh',
      deviceNum: 3,
      datasetPath: 'train.csv',
      arguments: [
        {
          key: 'learning_rate',
          value: 0.01,
          createTime: 4242142
        },
        {
          key: 'epoch',
          value: 20,
          createTime: 4242442
        },
        {
          key: 'dropout',
          value: 0.5,
          createTime: 4242443
        },
      ], engine: 'tensorflow',
      codePath: '/home/code/',
      deviceType: '1核 | 16GB | 1*AI加速卡	'
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
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '8'
        }}
      >
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
                expandedRowRender: record => <ExpandDetail record={record} />
              }}
              dataSource={data}
            />
          </Col>
        </Row>
      </Card>
    </PageHeaderWrapper>
  );
};

export default ParamsManage;