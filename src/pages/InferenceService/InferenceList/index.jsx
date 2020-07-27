import { Link, history } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space, Card, Select } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { stopInference } from './services';
import { PAGEPARAMS, REFRESH_INTERVAL } from '@/utils/const';
import { connect } from 'umi';
import { SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { formatDuration } from '@/utils/time';

const { Option } = Select;

const InferenceList = props => {
  const {
    loading,
    dispatch,
    inferenceList: { data },
  } = props;
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();

  const statusList = [
    { en: 'all', cn: '全部' },
    { en: 'unapproved', cn: '未批准'},
    { en: 'queued', cn: '队列中'},
    { en: 'scheduling', cn: '调度中'},
    { en: 'running', cn: '运行中'},
    { en: 'finished', cn: '已完成'},
    { en: 'failed', cn: '已失败'},
    { en: 'pausing', cn: '暂停中'},
    { en: 'paused', cn: '已暂停'},
    { en: 'killing', cn: '关闭中'},
    { en: 'killed', cn: '已关闭'},
    { en: 'error', cn: '错误'},
  ]

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues]);

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
      },
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend', 'ascend'], 
    },
    {
      title: '使用模型',
      // dataIndex: 'model',
      // ellipsis: true,
      // width: 100
      render: (text, item) => item.jobParams?.model_base_path,
      sorter: (a, b) => a.jobParams.model_base_path.length - b.jobParams.model_base_path.length,
      sortDirections: ['descend', 'ascend'],   
    },
    {
      title: '状态',
      // dataIndex: 'jobStatus',
      // ellipsis: true,
      // width: 100
      render: (text, item) => getJobStatus(item.jobStatus),
      sorter: (a, b) => a.jobStatus.length - b.jobStatus.length,
      sortDirections: ['descend', 'ascend'],      
    },
    {
      title: '引擎类型',
      // dataIndex: 'engineType',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => item?.jobParams?.framework,
      sorter: (a, b) => a.jobParams.framework.length - b.jobParams.framework.length,
      sortDirections: ['descend', 'ascend'],       
    },
    {
      title: '创建时间',
      dataIndex: 'jobTime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      // ellipsis: true,
      // width: 150,
      sorter: (a, b) => a.jobTime - b.jobTime,
      sortDirections: ['descend', 'ascend'],    
    },
    {
      title: '运行时长',
      // dataIndex: 'runDuration',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => formatDuration(moment.duration(item.duration)),
      sorter: (a, b) => a.duration - b.duration,
      sortDirections: ['descend', 'ascend'],       
    },
    {
      title: '服务地址',
      // dataIndex: 'serverAddr',
      ellipsis: true,
      width: 100,
      render: (text, item) => item['inference-url'] ? item['inference-url'] : '',
      sorter: (a, b) => a['inference-url'].length - b['inference-url'].length,
      sortDirections: ['descend', 'ascend'],       
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
          <>
            <Button type="link" onClick={() => stopJob(item)} disabled={isStopDisabled(item)}>停止</Button>
            <Button type="link" onClick={() => deleteJob(item)}>删除</Button>
          </>
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
    setFormValues({status: 'all', name:''});
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
    let queryClauses = {};

    if (values.jobName) {
      queryClauses.name = values.jobName;
    }

    if (values.status) {
      queryClauses.status = values.status;
    }

    setFormValues({...formValues, ...queryClauses});
  };

  const handleSearch = () => {
    const params = {
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
    };

    if (formValues.status && formValues.status !== 'all') {
      params.status = formValues.status;
    }

    if (formValues.name) {
      params.name = formValues.name;
    }

    dispatch({
      type: 'inferenceList/fetch',
      payload: params,
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
        handleSearch();
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

  const handleStatusChange = (status) => {

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
              initialValues={{status: 'all'}}
            >
              <Form.Item
                name="status"
              >
                <Select style={{ width: 180 }} onChange={handleStatusChange}>
                  {
                    statusList.map((item) => (
                      <Option key= {item.en} value={item.en}>{item.cn}</Option>
                    ))
                  }
                </Select>
              </Form.Item>              
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
                <Button icon={<SyncOutlined />} onClick={() => handleSearch()}></Button>
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