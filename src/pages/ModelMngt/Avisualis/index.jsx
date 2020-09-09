import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
import { getAvisualis } from './service';
import { PAGEPARAMS, sortText } from '@/utils/const';
import styles from './index.less';
import { Link, history, useDispatch } from 'umi';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';
import { connect } from 'dva';
import AddFormModal from './components/AddFormModal';

const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

const Avisualis = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [avisualisData, setAvisualisData] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [modelTypesData, setModelTypeData] = useState('');
  const [sortedInfo, setSortedInfo] = useState({
    orderBy: '',
    order: ''
  });
  const addFormModalRef = useRef();

  useEffect(() => {
    getData();
  }, [pageParams, sortedInfo]);

  const getData = async () => {
    setLoading(true);
    const params = { 
      ...pageParams, 
      // name: name, 
      orderBy: sortedInfo.columnKey,
      order: sortText[sortedInfo.order],
      isAdvance: false
    };
    const { code, data } = await getAvisualis(params);
    if (code === 0 && data) {
      const { total, models } = data;
      setAvisualisData({
        data: models,
        total: total,
      });
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
    addFormModalRef.current.form.validateFields().then(async (values) => {
      dispatch({
        type: 'avisualis/saveData',
        payload: {
          addFormData: values
        }
      });
      history.push(`/ModelManagement/avisualis/detail?type=${values.use}`);
    });
  };

  const columns = [
    {
      title: '模型名称',
      key: 'name',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'name' && sortedInfo.order,
      render: item => <Link to={{ pathname: '/ModelManagement/avisualis/detail', query: { id: item.id, type: 'Avisualis_Classfication' } }}>{item.name}</Link>,
    },
    {
      title: '模型用途',
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

  const onClickAdd = async () => {
    setModalFlag(true);
    const params = { 
      pageNum: 1,
      pageSize: 999,
      isAdvance: true,
      use: 'Avisualis'
    };
    const { code, data } = await getAvisualis(params);
    if (code === 0 && data) setModelTypeData(data.models);
  }

  return (
    <PageHeaderWrapper>
      <Card>
        <div className={styles.avisualisWrap}>
          <Button type="primary" style={{ marginBottom: 16 }} onClick={onClickAdd}>新建模型</Button>
          <div className={styles.searchWrap}>
            <Search placeholder="请输入模型名称查询" enterButton onSearch={() => setPageParams({ ...pageParams, pageNum: 1 })} onChange={e => setName(e.target.value)} />
            <Button onClick={() => getData('刷新成功！')} icon={<SyncOutlined />} />
          </div>
          <Table
            columns={columns}
            dataSource={avisualisData.data}
            rowKey={r => r.id}
            onChange={onSortChange}
            pagination={{
              total: avisualisData.total,
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
            <Button type="primary" onClick={onSubmit}>下一步</Button>
          ]}
        >
          <AddFormModal 
            modelTypesData={modelTypesData}
            ref={addFormModalRef} 
          />
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default connect(({ avisualis }) => ({ avisualis }))(Avisualis);