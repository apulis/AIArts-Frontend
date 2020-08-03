import { Link, history } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space, Card, Select } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { stopInference, deleteInference } from './services';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { connect } from 'umi';
import { SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { getJobStatus } from '@/utils/utils';
import { formatDuration } from '@/utils/time';
import { fetchJobStatusSumary } from './services';
import { statusList } from '@/pages/ModelTraining/List';

const { Option } = Select;
const { Search } = Input;

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
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });
  const [jobSumary, setJobSumary] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('all');

  const getJobStatusSumary = async () => {
    const res = await fetchJobStatusSumary();
    if (res.code === 0) {
      const jobSumary = [{ value: 'all', label: '全部' }];
      let total = 0;
      Object.keys(res.data).forEach(k => {
        let count = res.data[k]
        total += count;
        jobSumary.push({
          label: statusList.find(status => status.value === k)?.label + `（${count}）`,
          value: k
        })
      })
      jobSumary[0].label = jobSumary[0].label  + `（${total}）`
      setJobSumary(jobSumary)
    }
  };
  
  useEffect(() => {
    getJobStatusSumary();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues, sortedInfo]);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const onSortChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const columns = [
    {
      title: '作业名称',
      dataIndex: 'jobName',
      key: 'jobName',
      // ellipsis: true,
      // width: 150
      render(_text, item) {
        return (
          <Link to={`/Inference/${item.jobId}/detail`}>{item.jobName}</Link>
        )
      },
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobName' && sortedInfo.order,      
    },
    {
      title: '使用模型',
      // dataIndex: 'model',
      // ellipsis: true,
      // width: 100
      render: (text, item) => item.jobParams?.model_base_path,
    },
    {
      title: '状态',
      // dataIndex: 'jobStatus',
      // ellipsis: true,
      // width: 100
      render: (text, item) => getJobStatus(item.jobStatus),
    },
    {
      title: '引擎类型',
      // dataIndex: 'engineType',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => item?.jobParams?.framework,
    },
    {
      title: '创建时间',
      dataIndex: 'jobTime',
      key: 'jobTime',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      // ellipsis: true,
      // width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'jobTime' && sortedInfo.order,         
    },
    {
      title: '运行时长',
      // dataIndex: 'runDuration',
      // ellipsis: true,
      // width: 100,
      render: (text, item) => formatDuration(moment.duration(item.duration)),
    },
    {
      title: '服务地址',
      // dataIndex: 'serverAddr',
      ellipsis: true,
      width: 100,
      render: (text, item) => item['inference-url'] ? item['inference-url'] : '',
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
            <Button type="link" onClick={() => deleteJob(item)} disabled={isDeleteDisabled(item)}>删除</Button>
          </>
        );
      },
    },
  ];

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const onSearchName = (name) => {
    setFormValues({...formValues, ...{name}});
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

  const handleSearch = () => {
    const params = {
      ...pageParams,
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]
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

  const isDeleteDisabled = item =>{
    if(item.jobStatus === 'failed' || item.jobStatus === 'error' || item.jobStatus === 'unapproved' || item.jobStatus === 'finished' || item.jobStatus === 'killed' || item.jobStatus === 'paused'){
      return false;
    }else{
      return true;
    }
  }

  const stopJob = async (item) => {
    const params = {jobId: item.jobId};
    const {code, msg, data} = await stopInference(params);

    if(code === 0){
      message.success(`Job成功停止！`);
      handleSearch();
    }else{
      message.error(`Job停止错误：${msg}。`);
    }
  };

  const deleteJob = async (item) => {
    const {code, msg, data} = await deleteInference(item.jobId);

    if(code === 0){
      message.success(`Job删除停止！`);
      handleSearch();
    }else{
      message.error(`Job删除错误：${msg}。`);
    }
  };

  const CreateJob = (item) => {
    history.push('/Inference/submit')
  };

  const handleStatusChange = (status) => {
    // setCurrentStatus(status);
    setFormValues({...formValues, ...{status}});
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
          <Button type="primary" onClick={CreateJob}>创建推理作业</Button>
          <div
            style={{
              float: "right",
              paddingRight: '20px',
            }}          
          >
            <Select style={{ width: 180, marginRight:'20px' }} defaultValue={currentStatus} onChange={handleStatusChange}>
              {
                jobSumary.map((item) => (
                  <Option key= {item.value} value={item.value}>{item.label}</Option>
                ))
              }
            </Select>            
            <Search style={{ width: '200px', marginRight:'20px' }} placeholder="请输入作业名称" onSearch={onSearchName} enterButton />
            <Button icon={<SyncOutlined />} onClick={() => handleSearch()}></Button>
          </div>            
        </div>
        <Table
          columns={columns}
          dataSource={data.list}
          rowKey={r => r.jobId}
          onChange={onSortChange}
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