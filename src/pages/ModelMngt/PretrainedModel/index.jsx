import { history } from 'umi'
import { Table, Form, Input, Button, Card, Descriptions, Popover } from 'antd';
import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { PAGEPARAMS } from '@/utils/const';
import { connect } from 'umi';
import { SyncOutlined } from '@ant-design/icons';
import { stringify } from 'querystring';
import moment from 'moment';

const ExpandDetails = (item) => {
  // 模拟数据
  item = {
    dataset: 'ILSVRC-2012 (ImageNet-1k)',
    format: '图像，256*256',
    arguments: [
      {
        key: 'learning_rate',
        value: 0.01123123123123
      }
    ],
    engineType: 'tensorflow , tf-1.8.0-py2.7',
    output: '--',
  }
  const argumentsContent = (
    <div>
      {item.arguments.map(a => {
        return <p>{a.key + '=' + a.value}</p>;
      })}
    </div>
  );

  const argsSuffix = item.arguments.length > 1 ? '...' : '';

  return (
    <Descriptions>
      <Descriptions.Item label="训练数据集">{item.dataset}</Descriptions.Item>
      <Descriptions.Item label="数据格式">{item.format}</Descriptions.Item>
      <Descriptions.Item label="运行参数">
        <Popover content={argumentsContent}>
          {item.arguments.length > 0 && 
            <div>{item.arguments[0].key + '=' + item.arguments[0].value + argsSuffix}</div>
          }
        </Popover>
      </Descriptions.Item>
      <Descriptions.Item label="引擎类型">{item.engineType}</Descriptions.Item>
      <Descriptions.Item label="模型输出">{item.output}</Descriptions.Item>
    </Descriptions>    
  );
}

const PretrainedModelList = props => {
  const {
    loading,
    dispatch,
    pretrainedModelList: { data },
  } = props;
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [form] = Form.useForm();

  useEffect(() => {
    handleRefresh();
  }, [pageParams]);

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 150,
    },
    {
      title: '模型用途',
      dataIndex: 'use',
      ellipsis: true,
      width: 100,
    },
    // {
    //   title: '引擎类型',
    //   dataIndex: 'type',
    //   ellipsis: true,
    //   width: 100,
    // },
    {
      title: '模型精度',
      dataIndex: 'precision',
      ellipsis: true,
      width: 100,
    },
    {
      title: '模型大小',
      dataIndex: 'size',
      ellipsis: true,
      width: 150
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      width: 220,
      render: (item) => {
        return (
          <a onClick={() => createInference(item)}>创建训练作业</a>
        );
      },
    },
  ];

  const onReset = () => {
    form.resetFields();
    handleRefresh();
  };

  const onFinish = values => {
    dispatch({
      type: 'pretrainedModelList/fetch',
      payload: {
        pageNum: pageParams.pageNum,
        pageSize: pageParams.pageSize,
        name: values.modelName     
      },
    });    
  };

  const handleRefresh = () => {
    dispatch({
      type: 'pretrainedModelList/fetch',
      payload: {
        pageNum: pageParams.pageNum,
        pageSize: pageParams.pageSize
      }
    });
  };

  const createInference = (item) => {
    const queryString = stringify({
      modelPath: encodeURIComponent(item.path)
    });
    history.push((`/Inference/submit/?${queryString}`))
  };

  const addPretrainedModel = (item) => {
    history.push(`/ModelManagement/CreatePretrained`);
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
          {/* <Button type="default" onClick={addPretrainedModel}>录入模型</Button> */}
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
                <Button icon={<SyncOutlined />} onClick={() => handleRefresh()}></Button>
              </Form.Item>
            </Form>
          </div>            
        </div>
        <Table
          columns={columns}
          dataSource={data.list}
          rowKey='id'
          pagination={{
            total: data.pagination.total,
            showQuickJumper: true,
            showTotal: (total) => `总共 ${total} 条`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
          }}
          loading={loading}
          expandable={{
            expandedRowRender: record => ExpandDetails(record)
          }}
        />
      </Card>
    </PageHeaderWrapper>
  );
};

export default connect(({ pretrainedModelList, loading }) => ({
  pretrainedModelList,
  loading: loading.models.pretrainedModelList,
}))(PretrainedModelList);