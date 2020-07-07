import { message, Table, Modal, Form, Input, Button } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getDatasets, edit, deleteDataSet, add } from './service';
import { PAGEPARAMS } from '../../const';
import styles from './index.less';
import { Link } from 'umi';
import Mock from 'mockjs';
import AddModalForm from './components/AddModalForm';
import { formatDate } from '@/utils/time';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

const DataSetList = () => {
  const [dataSets, setDataSets] = useState({ data: [], total: 0 });
  const [editData, setEditData] = useState({});
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState(0);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const addModalFormRef = useRef();

  useEffect(() => {
    getData();
  }, [pageParams]);

  const getData = async () => {
    const { page, count } = pageParams;
    const { code, data, msg } = await getDatasets(page, count);
    if (code === 0 && data) {
      const { total, datasets } = data;
      setDataSets({
        data: datasets,
        total: total,
      });
    } else {
      message.error(msg);
    }
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ page: page, count: count });
  };

  const onSubmit = () => {
    addModalFormRef.current.form.validateFields().then(async (values) => {
      let res = {}, text = '';
      if (modalType) {
        text = '编辑';
        res = await edit(editData.id, values);
      } else {
        values.storage_path = values.file.file.response.data.path;
        delete values.file;
        text = 'Add';
        res = await add(values);
      }
      const { code, msg } = res;
      if (code === 0) {
        getData();
        message.success(`${text}成功！`);
        setModalFlag(false);
      } else {
        message.error(msg);
      }
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
      dataIndex: 'updated_at',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS')
    },
    {
      title: '更新版本',
      dataIndex: 'version',
    },
    {
      title: '操作',
      render: item => {
        return (
          <>
            <a onClick={() => onEditClick(item)}>编辑</a>
            <a style={{ marginLeft: 16, color: 'red' }} onClick={() => onDelete(item.id)}>删除</a>
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

  return (
    <PageHeaderWrapper>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => showModal(0)}>新增数据集</Button>
      <Table
        columns={columns}
        dataSource={dataSets.data}
        rowKey={(r, i) => `${i}`}
        pagination={{
          total: dataSets.total,
          showQuickJumper: true,
          showTotal: total => `总共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
        }}
      />
      {modalFlag && (
        <Modal
          title={`${modalType ? '编辑' : '新增'} 数据集`}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={600}
          key="sad"
          className={styles.dataSetModal}
          footer={[
            <Button onClick={() => setModalFlag(false)}>取消</Button>,
            <Button type="primary" disabled={btnDisabled} onClick={onSubmit}>
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
