import { Link, history } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space, Card } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { stopInference } from './services';
import { PAGEPARAMS } from '@/utils/const';
import { connect } from 'umi';
import { SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

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
        pageNum: pageParams.pageNum,
        pageSize: pageParams.pageSize
      },
    });
  }, [pageParams]);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const columns = [
    {
      title: '作业名称',
      dataIndex: 'jobName',
      // ellipsis: true,
      // width: 150
      render(_text, item) {
        return (
          <Link to={`/Inference/${item.jobId}/detail`}>{item.jobName}</Link>
        )
      }
    },
    {
      title: '使用模型',
      // dataIndex: 'model',
      // ellipsis: true,
      // width: 100
      render: (text, item) => item.jobParams?.model_base_path
    },
    {
      title: '状态',
      dataIndex: 'jobStatus',
      // ellipsis: true,
      // width: 100
    },
    {
      title: '引擎类型',
      // dataIndex: 'engineType',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => item?.jobParams?.framework
    },
    {
      title: '创建时间',
      dataIndex: 'jobTime',
      render: text => moment(text).format('YYYY-MM-DD hh:mm:ss'),
      // ellipsis: true,
      // width: 150,
    },
    {
      title: '运行时长',
      // dataIndex: 'runDuration',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => moment.duration(Date.now()-item.jobTime)
    },
    {
      title: '服务地址',
      // dataIndex: 'serverAddr',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => item.jobParams['inference-url'] ? item.jobParams['inference-url'] : ''
    },
    {
      title: '描述',
      dataIndex: 'desc',
      // ellipsis: true,
      // width: 150
      render: (text, item) => item.jobParams?.desc
    },
    {
      title: '操作',
      width: 120,
      render: (item) => {
        return (
          <Space size="middle">
            <Button type="link" onClick={() => stopJob(item)} disabled={() => isStopDisabled(item)}>停止</Button>
            {/* <a onClick={() => stopJob(item)}>停止</a> */}
            {/* <a onClick={() => deleteJob(item)}>删除</a> */}
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
        pageNum: pageParams.pageNum,
        pageSize: pageParams.pageSize
      },
    });
  };

  const isStopDisabled = item =>{
    if(item.jobStatus === 'running' || item.jobStatus === 'queued' || item.jobStatus === 'scheduling'|| item.jobStatus === 'unapproved'){
      return false;
    }else{
      return true;
    }
  }

  const stopJob = async (item) => {
    if(item.jobStatus === 'running' || item.jobStatus === 'queued' || item.jobStatus === 'scheduling'|| item.jobStatus === 'unapproved'){
      const params = {jobId: item.jobId};
      const {code, msg, data} = await stopInference(params);
      if(code === 0){
        message.success(`Job成功停止！`);
      }else{
        message.error(`Job停止错误：${msg}。`);
      }
    }else{
      message.error('Job无法停止！');
    }
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
    history.push('/Inference/submit')
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
          rowKey={r => r.jobId}
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