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
    const { code, data, msg, total } = await getDatasets(page, count);
    if (code === 0) {
      setDataSets({
        data: data,
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
        text = 'Modified';
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
        message.success(`${text} Successfully！`);
        setModalFlag(false);
      } else {
        message.error(msg);
      }
    });
  };

  const columns = [
    {
      title: 'Dataset Name',
      key: 'name',
      render: item => <Link to={{ pathname: '/aIarts/dataSetManage/detail', query: { id: item.id } }}>{item.name}</Link>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      width: 350,
    },
    {
      title: 'creator',
      dataIndex: 'creator',
    },
    {
      title: 'Update Time',
      dataIndex: 'update_time',
      render: text => formatDate(text * 1000, 'YYYY-MM-DD HH:MM:SS')
    },
    {
      title: 'Update Version',
      dataIndex: 'version',
    },
    {
      title: 'Operation',
      render: item => {
        return (
          <>
            <a onClick={() => onEditClick(item)}>Modify</a>
            <a style={{ marginLeft: 16, color: 'red' }} onClick={() => onDelete(item.id)}>Delete</a>
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
      title: 'Are you sure to delete this dataSet？',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
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
    <PageHeaderWrapper title={false}>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => showModal(0)}>Add DataSet</Button>
      <Table
        columns={columns}
        dataSource={dataSets.data}
        rowKey={(r, i) => `${i}`}
        pagination={{
          total: dataSets.total,
          showQuickJumper: true,
          showTotal: total => `Total ${total} items`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
        }}
      />
      {modalFlag && (
        <Modal
          title={`${modalType ? 'Modify' : 'Add'} DataSet`}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          width={600}
          key="sad"
          className={styles.dataSetModal}
          footer={[
            <Button onClick={() => setModalFlag(false)}>Cancel </Button>,
            <Button type="primary" disabled={btnDisabled} onClick={onSubmit}>
              Submit
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
