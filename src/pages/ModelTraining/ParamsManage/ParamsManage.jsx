import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Select, Row, Col, Descriptions, Card, Popover, Form } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fetchTemplates, fetchTemplateById, removeTemplate } from '../../../services/modelTraning';
import { PAGEPARAMS } from '@/utils/const';

const { Search } = Input;
const { Option } = Select;

const ParamsManage = () => {

  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [paramList, setParamList] = useState([]);
  const [total, setTotal] = useState(0);
  const { getFieldsValue } = form;
  const statusList = [
    { en: '0', cn: '全部' },
    { en: '1', cn: '共有' },
    { en: '2', cn: '私有' },
  ];

  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const ExpandDetail = (props) => {
    const record = props.record;
    const argumentsContent = (
      <div>
        {record.arguments.map(item => {
          return <p>{item.key + ':' + item.value}</p>;
        })}
      </div>
    );
    return (
      <Descriptions>
        <Descriptions.Item label="参数配置名称">{record.configName}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{record.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点数">{record.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{record.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="运行参数">
          <Popover title="训练参数" content={argumentsContent}>
            {record.arguments.map((item) => {
              return (
                <div>{item.key + ': ' + item.value + '; '}</div>
              );
            })}
          </Popover>
        </Descriptions.Item>
        <Descriptions.Item label="引擎类型">{record.engine}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{record.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{record.deviceType}</Descriptions.Item>
        <Descriptions.Item label="描述">{record.description}</Descriptions.Item>
      </Descriptions>
    );
  };

  const handleCreateTrainJob = (id) => {
    history.push(`paramManage/${id}/createJobWithParam`);
  };
  const handleEdit = (id) => {
    history.push(`paramManage/${id}/editParam`);
  };

  const handleDelete = async (id) => {
    const res = await removeTemplate(id);
    if (res.code === 0) {
      message.success('删除成功');
    }
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
            <a onClick={() => handleCreateTrainJob(id)}>创建训练作业</a>
            <a style={{ margin: '0 16px' }} onClick={() => handleEdit(id)}>编辑</a>
            <a style={{ color: 'red' }} onClick={() => handleDelete(id)}>删除</a>
          </>
        );
      },
    },
  ];
  // const data = [
  //   {
  //     key: 1,
  //     id: 1,
  //     configName: 'train_job_config_001',
  //     type: '训练',
  //     engine: 'tensorflow , tf-1.8.0-py2.7',
  //     createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
  //     description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
  //     startupFile: '/start.sh',
  //     deviceNum: 3,
  //     datasetPath: 'train.csv',
  //     arguments: [
  //       {
  //         key: 'learning_rate',
  //         value: 0.01,
  //         createTime: 4242142
  //       },
  //       {
  //         key: 'epoch',
  //         value: 20,
  //         createTime: 4242442
  //       },
  //       {
  //         key: 'dropout',
  //         value: 0.5,
  //         createTime: 4242443
  //       },
  //     ],
  //     engine: 'tensorflow',
  //     codePath: '/home/code/',
  //     deviceType: '1核 | 16GB | 1*AI加速卡	'
  //   },
  //   {
  //     key: 2,
  //     id: 2,
  //     configName: 'train_job_config_001',
  //     type: '训练',
  //     engine: 'tensorflow , tf-1.8.0-py2.7',
  //     createTime: 'Aug 5, 2017 7:20:57 AM GMT+08:00',
  //     description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
  //     startupFile: '/start.sh',
  //     deviceNum: 3,
  //     datasetPath: 'train.csv',
  //     arguments: [
  //       {
  //         key: 'learning_rate',
  //         value: 0.01,
  //         createTime: 4242142
  //       },
  //       {
  //         key: 'epoch',
  //         value: 20,
  //         createTime: 4242442
  //       },
  //       {
  //         key: 'dropout',
  //         value: 0.5,
  //         createTime: 4242443
  //       },
  //     ], engine: 'tensorflow',
  //     codePath: '/home/code/',
  //     deviceType: '1核 | 16GB | 1*AI加速卡	'
  //   },
  // ];

  const onReset = () => {
    form.resetFields();
    setFormValues({ status: '0', name: '' });
  };

  const handleSearch = async () => {
    const params = {
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
    };


    const value = getFieldsValue();

    if (value.status && value.status !== '0') {
      params.status = value.status;
    }

    if (value.name) {
      params.name = value.name;
    }

    console.log(params);
    const res = await getParamsList(params);

  };

  const getParamsList = async (params) => {
    const res = await fetchTemplates(params);
    setTableLoading(false);
    if (res.code === 0) {
      const paramList = (res.data && res.data.Trainings) || [];
      setParamList(paramList);
    }
  };

  const handleTypeChange = (value) => {

  };

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues]);

  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '8'
        }}
      >
        <Row gutter={[0, 16]} justify='end'>
          <Col>
            <Form
              layout='inline'
              form={form}
              initialValues={{ status: '0' }}
            >
              <Form.Item
                name="status"
                label="权限"
              >
                <Select style={{ width: 180 }} onChange={handleTypeChange}>
                  {
                    statusList.map((item) => (
                      <Option key={item.en} value={item.en}>{item.cn}</Option>
                    ))
                  }
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                label="参数配置名称"
              >
                <Search style={{ width: '200px' }} placeholder="输入参数配置名称" onSearch={handleSearch} />
              </Form.Item>
              <Form.Item>
                <Button htmlType="button" onClick={onReset}>重置</Button>
              </Form.Item>
              <Form.Item>
                <Button icon={<SyncOutlined />} onClick={() => handleSearch()}></Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              rowKey='id'
              pagination={{
                total: total,
                showQuickJumper: true,
                showTotal: (total) => `总共 ${total} 条`,
                showSizeChanger: true,
                onChange: pageParamsChange,
                onShowSizeChange: pageParamsChange,
              }}
              expandable={{
                expandedRowRender: record => <ExpandDetail record={record} />
              }}
              dataSource={paramList}
              loading={tableLoading}
            />
          </Col>
        </Row>
      </Card>
    </PageHeaderWrapper>
  );
};

export default ParamsManage;