import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
import { getDatasets, edit, deleteDataSet, add, download } from './service';
import { PAGEPARAMS, sortText, NameReg, NameErrorText } from '@/utils/const';
import styles from './index.less';
import { Link, history } from 'umi';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

const { confirm } = Modal;
const { Search } = Input;
const TYPES = [
  { text: '图像分类', key: 'Image Classification'},
  { text: '语义分割', key: 'Semantic Segmentation'},
  { text: '目标检测', key: 'Object Detection'}
];
const MODELTYPES = [
  { text: 'Pytorch样例模型', key: 'Pytorch样例模型'},
  { text: '工服安全帽检测', key: '工服安全帽检测'},
  { text: 'XRAY违禁品检测项目', key: 'XRAY违禁品检测项目'}
];

const Avisualis = () => {
  const [form] = Form.useForm();
  const [avisualis, setAvisualis] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [way, setWay] = useState(1);
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });

  useEffect(() => {
    getData();
  }, [pageParams, sortedInfo]);

  const getData = async (text) => {
    setLoading(true);
    const params = { 
      ...pageParams, 
      name: name, 
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order]
    };
    const { code, data } = await getDatasets(params);
    if (code === 0 && data) {
      const { total, datasets } = data;
      setAvisualis({
        data: datasets,
        total: total,
      });
      text && message.success(text);
    }
    setLoading(false);
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ pageNum: page, pageSize: count });
  };

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order !== false) {
      setSortedInfo(sorter);
    }
  }

  const onSubmit = () => {
    addModalFormRef.current.form.validateFields().then(async (values) => {
      setBtnLoading(true);
      history.push('/ModelManagement/avisualis/detail');
      setBtnLoading(false);
    });
  };

  const columns = [
    {
      title: '模型名称',
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: item => <Link to={{ pathname: '/ModelManagement/avisualis/detail', query: { id: item.id } }}>{item.name}</Link>,
    },
    {
      title: '任务类型',
      dataIndex: 'type'
    },
    {
      title: '简介',
      dataIndex: 'desc',
    },
    {
      title: '创建时间',
      key: 'updatedAt',
      dataIndex: 'updatedAt',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'updatedAt' && sortedInfo.order,
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      render: item => {
        const { id } = item;
        return (<a style={{ color: 'red' }} onClick={() => onDelete(id)}>删除</a>)
      },
    },
  ];

  const onDelete = id => {
    confirm({
      title: '确定要删除该模型吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const { code } = await deleteDataSet(id);
        if (code === 0) {
          // 若删除的是当前页最后一项，且页数不是第一页，则将页数减一
          if (dataSets.data.length == 1 && pageParams.pageNum > 1) {
            setPageParams({ ...pageParams, pageNum: pageParams.pageNum - 1 });
          } else {
            getData();
          }
          message.success('删除成功！');
        }
      },
      onCancel() {}
    });
  }

  return (
    <PageHeaderWrapper>
      <Card>
        <div className={styles.avisualisWrap}>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={() => setModalFlag(true)}>新建模型</Button>
          <div className={styles.searchWrap}>
            <Search placeholder="请输入模型名称查询" enterButton onSearch={() => setPageParams({ ...pageParams, pageNum: 1 })} onChange={e => setName(e.target.value)} />
            <Button onClick={() => getData('刷新成功！')} icon={<SyncOutlined />} />
          </div>
          <Table
            columns={columns}
            dataSource={avisualis.data}
            rowKey={r => r.id}
            onChange={onSortChange}
            pagination={{
              total: avisualis.total,
              showQuickJumper: true,
              showTotal: total => `总共 ${total} 条`,
              showSizeChanger: true,
              onChange: pageParamsChange,
              onShowSizeChange: pageParamsChange,
              current: pageParams.pageNum,
              pageSize: pageParams.pageSize
            }}
            loading={loading}
          />
        </div>
      </Card>
      {modalFlag && (
        <Modal
          title="新建模型"
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          className={styles.avisualisModal}
          footer={[
            <Button onClick={() => setModalFlag(false)}>取消</Button>,
            <Button type="primary" loading={btnLoading} onClick={onSubmit}>提交</Button>
          ]}
        >
          <Form form={form} preserve={false} initialValues={{ way: way }}>
            <Form.Item
              label="模型名称"
              name="jobName"
              rules={[
                { required: true, message: '请输入推理名称！' }, 
                { pattern: NameReg, message: NameErrorText },
                { max: 20 }
              ]}
            >
              <Input placeholder="请输入模型名称" />
            </Form.Item>
            <Form.Item
              label="任务类型"
              name="type"
              rules={[{ required: true, message: '请选择任务类型！' }]}
            >
              <Select placeholder="请选择类型">
                {TYPES.map(i => <Option value={i.key}>{i.text}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item
              label="简介"
              name="description"
              rules={[{ required: true, message: '请输入简介！' }, { max: 50 }]} 
            >
              <Input.TextArea placeholder="请输入简介" autoSize={{ minRows: 4 }} />
            </Form.Item>
            <Form.Item label="创建方式" rules={[{ required: true }]} name="way">
              <Radio.Group onChange={e => setWay(e.target.value)}>
                <Radio value={1}>自定义</Radio>
                <Radio value={2}>使用内置模型</Radio>
              </Radio.Group>
            </Form.Item>
            {way === 2 && <Form.Item
              label="选择模型"
              name="modelType"
              rules={[{ required: true, message: '请选择模型！' }]}
            >
              <Select placeholder="请选择模型">
                {MODELTYPES.map(i => <Option value={i.key}>{i.text}</Option>)}
              </Select>
            </Form.Item>}
          </Form>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default Avisualis;
