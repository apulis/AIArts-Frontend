import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Button, Select, Row, Col, Descriptions, Card, Popover, Form, message } from 'antd';
import { SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { fetchTemplates, removeTemplate } from '../../../services/modelTraning';
import { PAGEPARAMS, sortText } from '@/utils/const';
import moment from 'moment';

const { confirm } = Modal;
const { Option } = Select;

const ParamsManage = () => {

  const [tableLoading, setTableLoading] = useState(true);
  const [formValues, setFormValues] = useState({});
  const [form] = Form.useForm();
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [paramList, setParamList] = useState([]);
  const [total, setTotal] = useState(0);
  const { getFieldsValue } = form;
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });
  const statusList = {
    '3': '全部',
    '1': '共有',
    '2': '私有',
  };


  const pageParamsChange = (page, size) => {
    setPageParams({ pageNum: page, pageSize: size });
  };

  const ExpandDetail = (props) => {
    const record = props.record;
    const argumentsContent = (
      <div>
        {Object.entries(record.params.params).map(item => {
          return <p key={item[0]}>{item[0] + ':' + item[1]}</p>;
        })}
      </div>
    );
    return (
      <Descriptions>
        <Descriptions.Item label="参数配置名称">{record.params.name}</Descriptions.Item>
        <Descriptions.Item label="启动文件">{record.params.startupFile}</Descriptions.Item>
        <Descriptions.Item label="计算节点数">{record.params.deviceNum}</Descriptions.Item>
        <Descriptions.Item label="训练数据集">{record.params.datasetPath}</Descriptions.Item>
        <Descriptions.Item label="运行参数">
          <Popover title="运行参数" content={argumentsContent}>
            {
              Object.entries(record.params.params).map(item => {
                return <p key={item[0]}>{item[0] + ':' + item[1]}</p>;
              })
            }
          </Popover>
        </Descriptions.Item>
        <Descriptions.Item label="引擎类型">{record.params.engine}</Descriptions.Item>
        <Descriptions.Item label="代码目录">{record.params.codePath}</Descriptions.Item>
        <Descriptions.Item label="计算节点规格">{record.params.deviceType}</Descriptions.Item>
        <Descriptions.Item label="描述">{record.params.desc}</Descriptions.Item>
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
    confirm({
      title: '删除参数配置',
      icon: <ExclamationCircleOutlined />,
      content: '删除操作无法恢复，是否继续？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await removeTemplate(id);
        if (res.code === 0) {
          message.success('删除成功');
          handleSearch();
        } else {
          message.error(`删除失败${error.msg}` || `删除失败`);
        }
      },
      onCancel() {
      },
    });
  };

  const columns = [
    {
      title: '参数配置名称',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'configName' && sortedInfo.order,
      dataIndex: ['params', 'name'],
      key: 'configName',
    },
    {
      title: '权限', dataIndex: ['metaData', 'scope'], key: 'type',
      render: index => statusList[index]
    },
    { title: '引擎类型', dataIndex: ['params', 'engine'], key: 'engine' },
    {
      title: '创建时间',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order,
      dataIndex: ['metaData', 'createdAt'],
      key: 'createdAt',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '描述',
      width: '25%',
      ellipsis: true,
      dataIndex: ['params', 'desc']
    },
    {
      title: '操作',
      width: '16%',
      render: item => {
        const id = item.metaData.id;
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

  const onReset = () => {
    form.resetFields();
    setFormValues({ scope: '3', name: '' });
  };

  const handleSearch = async () => {
    const params = {
      pageNum: pageParams.pageNum,
      pageSize: pageParams.pageSize,
      jobType: 'artsTraining',
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]
    };
    const value = getFieldsValue();
    if (value.scope) {
      params.scope = value.scope;
    }
    if (value.name) {
      params.name = value.name;
    }
    console.log(params)
    const res = await getParamsList(params);
  };

  const getParamsList = async (params) => {
    setTableLoading(true);
    const res = await fetchTemplates(params);
    console.log(res)
    if (res.code === 0) {
      const paramList = (res.data && res.data.Templates) || [];
      setParamList(paramList);
      const total = (res.data && res.data.total) || 0;
      setTotal(total);
    }
    setTableLoading(false);
  };

  const onSortChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleTypeChange = (value) => {
  };

  useEffect(() => {
    handleSearch();
  }, [pageParams, formValues, sortedInfo]);

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
              initialValues={{ scope: '3' }}
            >
              <Form.Item
                name="scope"
                label="权限"
              >
                <Select style={{ width: 180 }} onChange={handleTypeChange}>
                  <Option value='3'>全部</Option>
                  <Option value='1'>共有</Option>
                  <Option value='2'>私有</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                label="参数配置名称"
              >
                <Input style={{ width: '200px' }} placeholder="输入参数配置名称"/>
              </Form.Item>
              <Form.Item>
                <Button htmlType="button" onClick={onReset}>重置</Button>
              </Form.Item>
              <Form.Item>
                <Button htmlType="button" onClick={handleSearch}>查询</Button>
              </Form.Item>
              <Form.Item>
                <Button icon={<SyncOutlined />} onClick={() => handleSearch()}></Button>
              </Form.Item>
            </Form>
          </Col>
          <Col span={24}>
            <Table
              columns={columns}
              rowKey={record => record.metaData.id}
              onChange={onSortChange}
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