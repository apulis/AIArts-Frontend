import { Link, history } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space, Card } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProjects, deleteProject, addProject, updateProject } from './services';
import { PAGEPARAMS } from '../../../const';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
import { SyncOutlined } from '@ant-design/icons';

const InferenceList = props => {
  const {
    loading,
    dispatch,
    inferenceList: { data },
  } = props;
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch({
      type: 'inferenceList/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  }, [pageParams]);

  const pageParamsChange = (page, size) => {
    setPageParams({ page: page, size: size });
  };

  const columns = [
    {
      title: '作业名称',
      dataIndex: 'name',
      // ellipsis: true,
      // width: 150
    },
    {
      title: '使用模型',
      dataIndex: 'model',
      // ellipsis: true,
      // width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      // ellipsis: true,
      // width: 100
    },
    {
      title: '引擎类型',
      dataIndex: 'engineType',
      // ellipsis: true,
      // width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS'),
      // ellipsis: true,
      // width: 150,
    },
    {
      title: '运行时长',
      dataIndex: 'runDuration',
      // ellipsis: true,
      // width: 100,
    },
    {
      title: '服务地址',
      dataIndex: 'serverAddr',
      // ellipsis: true,
      // width: 100,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      // ellipsis: true,
      // width: 150
    },
    {
      title: '操作',
      width: 120,
      render: (item) => {
        return (
          <Space size="middle">
            <a onClick={() => stopJob(item)}>停止</a>
            <a onClick={() => deleteJob(item)}>删除</a>
          </Space>
        );
      },
    },
  ];

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const onReset = () => {
    form.resetFields();
  };
  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = values => {
    const id = current ? current.id : '';
    const params = {id, ...values }
    dispatch({
      type: 'inferenceList/update',
      payload: params
    });
  };

  const onFinish = values => {
    console.log(values.jobName);
  };

  const handleRefresh = () => {
    dispatch({
      type: 'inferenceList/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  };

  const stopJob = (item) => {
    dispatch({
      type: 'inferenceList/stop',
      payload: {
        id: item.id
      }
    });
  };

  const deleteJob = (item) => {
    dispatch({
      type: 'inferenceList/delete',
      payload: {
        id: item.id
      }
    });
  };

  const CreateJob = (item) => {
    history.push('/ModelMngt/CreateModel')
  };

  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '0'
        }}
      >
        <div
          style={{
            padding: '24px 0 24px 24px'
          }}
        >
          <Button type="default" onClick={CreateJob}>创建推理作业</Button>
          <div
            style={{
              float: "right",
            }}          
          >
            <Form
              layout='inline'
              form={form}
              onFinish={onFinish}
            >
              <Form.Item
                name="jobName" 
                label="作业名称"
              >
                <Input placeholder="请输入作业名称" />
              </Form.Item>
              <Form.Item>
                <Button htmlType="button" onClick={onReset}>重置</Button>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">查询</Button>
              </Form.Item>
              <Form.Item>
                <Button icon={<SyncOutlined />} onClick={() => handleRefresh()}></Button>
              </Form.Item>
            </Form>
          </div>            
        </div>
        <Table
          columns={columns}
          dataSource={data.list}
          rowKey={(r, i) => `${i}`}
          pagination={{
            total: data.pagination.total,
            showQuickJumper: true,
            showTotal: (total) => `总共 ${total} 条`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
          }}
          loading={loading}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ inferenceList, loading }) => ({
  inferenceList,
  loading: loading.models.inferenceList,
}))(InferenceList);