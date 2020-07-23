import { message, Table, Modal, Form, Input, Button } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getDatasets, edit, deleteDataSet, add, download } from './service';
import { PAGEPARAMS } from '@/utils/const';
import styles from './index.less';
import { Link } from 'umi';
import Mock from 'mockjs';
import AddModalForm from './components/AddModalForm';
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import moment from 'moment';

const { confirm } = Modal;
const { Search } = Input;

const DataSetList = () => {
  const [dataSets, setDataSets] = useState({ data: [], total: 0 });
  const [editData, setEditData] = useState({});
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState(0);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const addModalFormRef = useRef();

  useEffect(() => {
    getData();
  }, [pageParams, name]);

  const getData = async (text) => {
    setLoading(true);
    const { code, data, msg } = await getDatasets({ ...pageParams, name });
    if (code === 0 && data) {
      const { total, datasets } = data;
      setDataSets({
        data: datasets,
        total: total,
      });
      text && message.success(text);
    } else {
      message.error(msg);
    }
    setLoading(false);
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ pageNum: page, pageSize: count });
  };

  const onSubmit = () => {
    addModalFormRef.current.form.validateFields().then(async (values) => {
      let res = null, text = '';
      const { sourceType, path, file } = values;
      setBtnLoading(true);
      if (modalType) {
        text = '编辑';
        res = await edit(editData.id, values);
      } else {
        values.path = sourceType === 1 ? file.file.response.data.path : path;
        delete values.file;
        delete values.sourceType;
        text = '新增';
        res = await add(values);
      }
      const { code, msg } = res;
      if (code === 0) {
        getData();
        message.success(`${text}成功！`);
        setModalFlag(false);
      }
      setBtnLoading(false);
    });
  };

  const columns = [
    {
      title: '数据集名称',
      key: 'name',
      render: item => <Link to={{ pathname: '/dataManage/dataSet/detail', query: { id: item.id } }}>{item.name}</Link>,
    },
    {
      title: '简介',
      dataIndex: 'description',
      ellipsis: true,
      width: 350,
    },
    {
      title: '创建者',
      dataIndex: 'creator',
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      render: text => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '更新版本',
      dataIndex: 'version',
    },
    {
      title: '操作',
      render: item => {
        const { id } = item;
        return (
          <>
            <a onClick={() => onEditClick(item)}>编辑</a>
            <a style={{ margin: '0 16px' }} onClick={() => window.open(`/ai_arts/api/files/download/dataset/${id}`)}>下载</a>
            <a style={{ color: 'red' }} onClick={() => onDelete(id)}>删除</a>
          </>
        )
      },
    },
  ];

  const onEditClick = item => {
    setEditData(item); 
    showModal(1);
  };

  const onDelete = id => {
    confirm({
      title: '确定要删除改数据集吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await deleteDataSet(id);
        const { code, msg } = res;
        if (code === 0) {
          message.success('删除成功！');
          getData();
        } else {
          message.error(msg);
        }
      },
      onCancel() {}
    });
  }

  const showModal = type => {
    setModalType(type);
    setModalFlag(true);
  }

  if (loading) return (<PageLoading />)

  return (
    <PageHeaderWrapper>
      <div className={styles.datasetWrap}>
        <Button type="primary" style={{ marginBottom: 16 }} onClick={() => showModal(0)}>新增数据集</Button>
        <div className={styles.searchWrap}>
          <Search placeholder="请输入数据集名称或者创建者查询" enterButton onSearch={v => setName(v)} />
          <Button onClick={() => getData('刷新成功！')} icon={<SyncOutlined />} />
        </div>
        <Table
          columns={columns}
          dataSource={dataSets.data}
          rowKey={r => r.id}
          pagination={{
            total: dataSets.total,
            showQuickJumper: true,
            showTotal: total => `总共 ${total} 条`,
            showSizeChanger: true,
            onChange: pageParamsChange,
            onShowSizeChange: pageParamsChange,
            current: pageParams.pageNum,
            pageSize: pageParams.pageSize
          }}
        />
      </div>
      {modalFlag && (
        <Modal
          title={`${modalType ? '编辑' : '新增'} 数据集`}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={600}
          className={styles.dataSetModal}
          footer={[
            <Button onClick={() => setModalFlag(false)}>取消</Button>,
            <Button type="primary" disabled={btnDisabled} loading={btnLoading} onClick={onSubmit}>
              提交
            </Button>,
          ]}
        >
          <AddModalForm ref={addModalFormRef} setBtn={setBtnDisabled} modalType={modalType} editData={editData}></AddModalForm>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default DataSetList;
