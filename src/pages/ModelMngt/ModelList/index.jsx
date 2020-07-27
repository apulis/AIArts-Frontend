import { history } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space, Card, Select } from 'antd';
import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PAGEPARAMS, sortText } from '@/utils/const';
import ModalForm from './components/ModalForm';
import { connect } from 'umi';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { downloadModel } from '../ModelList/services';
import { stringify } from 'querystring';
import moment from 'moment';
import { getModelStatus } from '@/utils/utils';

const { confirm } = Modal;
const { Option } = Select;

const ModelList = props => {
  const {
    loading,
    dispatch,
    modelList: { data },
  } = props;
  
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });

  const statusList = [
    { en: 'all', cn: '全部' },
    { en: 'normal', cn: '正常'},
    { en: 'deleting', cn: '删除中'},
  ]

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
      title: '模型名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,      
    },
    {
      title: '状态',
      ellipsis: true,
      width: 100,
      render: (text, item) => getModelStatus(item.status),
    },
    // {
    //   title: '引擎类型',
    //   dataIndex: 'type',
    //   ellipsis: true,
    //   width: 100,
    // },
    {
      title: '存储路径',
      dataIndex: 'modelPath',
      ellipsis: true,
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: 150,
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createdAt' && sortedInfo.order,      
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      width: 150
    },
    {
      title: '操作',
      width: 220,
      render: (item) => {
        return (
          <Space size="middle">
            <a onClick={() => handleDownload(item)}>模型下载</a>
            <a onClick={() => createInference(item)}>创建推理</a>
            {/* <a onClick={() => modifyModel(item)}>编辑</a> */}
            <a onClick={() => deleteModel(item)}>删除</a>
            <a onClick={() => evaluateModel(item)}>模型评估</a>
          </Space>
        );
      },
    },
  ];

  const modifyModel = (item) => {
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

  const handleSubmit = async (values) => {
    const id = current ? current.id : '';

    if(id){
      const { description } = values;

      const { error, msg } = await dispatch({
        type: 'modelList/update',
        payload: { id, description },
      });

      if(error === null){
        message.success(`编辑成功`);
        handleSearch();
      }else{
        msg && message.error(`编辑失败:${msg}`);        
      }
      setVisible(false);
    }
  };

  const onFinish = values => {
    let queryClauses = {};

    if (values.modelName) {
      queryClauses.name = values.modelName;
    }

    if (values.status) {
      queryClauses.status = values.status;
    }

    setFormValues({...formValues, ...queryClauses});
  };

  const handleSearch = () => {
    const params = {
      isAdvance: false,
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
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
      type: 'modelList/fetch',
      payload: params,
    });
  };

  const handleDownload = async (item) => {
    window.open(`/ai_arts/api/files/download/model/${item.id}`, '_blank')
  };

  const createInference = (item) => {
    const queryString = stringify({
      modelPath: encodeURIComponent(item.modelPath)
    });
    history.push((`/Inference/submit/?${queryString}`))
  };

  const evaluateModel = (item) => {
    const queryString = stringify({
      modelName: encodeURIComponent(item.name),
      modelId: encodeURIComponent(item.id),
    });
    history.push((`/ModelManagement/CreateEvaluation/?${queryString}`))
  };

  const deleteModel = (item) => {
    confirm({
      title: '删除模型',
      icon: <ExclamationCircleOutlined />,
      content: '删除操作无法恢复，是否继续？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        dispatch({
          type: 'modelList/delete',
          payload: {
            id: item.id
          }
        }).then(({ error }) => {
          if (error === null) {
            message.success(`删除成功`);
            handleSearch();
          } else {
            message.error(`删除失败${error.msg}` || `删除失败`);
          }
        })
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  const createModel = (item) => {
    history.push('/ModelMngt/CreateModel')
  };

  const handleChange = (status) => {

  };

  return (
    <>
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
            <Button type="default" onClick={createModel}>创建模型</Button>
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
                  <Select style={{ width: 180 }} onChange={handleChange}>
                    {
                      statusList.map((item) => (
                        <Option key= {item.en} value={item.en}>{item.cn}</Option>
                      ))
                    }
                  </Select>
                </Form.Item>
                <Form.Item
                  name="modelName" 
                  label="模型名称"
                >
                  <Input placeholder="请输入模型名称" />
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
            rowKey='id'
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

      {visible && <ModalForm
        current={current}
        visible={visible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />}
    </>
  );
};

export default connect(({ modelList, loading }) => ({
  modelList,
  loading: loading.models.modelList,
}))(ModelList);