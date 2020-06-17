import { message, Table, Modal, Form, Input, Button } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef } from 'react';
import { getDatasets, getDatasetDetail } from './service';
import { PAGEPARAMS } from '../../const';
import styles from './index.less';
import { Link } from 'umi';
import Mock from 'mockjs';
import AddModalForm from './components/AddModalForm';
import { formatDate } from '@/utils/time';

const { confirm } = Modal;

const DataSetList = () => {
  const [dataSets, setDataSets] = useState({ data: [], total: 0 });
  const [editData, setEditData] = useState({});
  const [modalFlag, setModalFlag] = useState(false);
  const [modalType, setModalType] = useState(0);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const addModalFormRef = useRef();

  useEffect(() => {
    getData();
  }, [pageParams]);

  const getData = async () => {
    const { page, count } = pageParams;
    // const { code, data, msg, total } = await getDatasets(page, size);
    const { successful, dataSets, msg, totalCount } = { 
      successful: 'true',
      totalCount: 5,
      dataSets: [{
        name: 'MNIST',
        id: 1,
        description: 'THE MNIST DATABASE of handwritten digits',
        creator:  Mock.mock('@cname'),
        update_time: 1592364634,
        version: 'V009'
      },
      {
        name: 'coco/2014',
        id: 2,
        description: 'a large-scale object detection, segmentation, and captioning datas',
        creator:  Mock.mock('@cname'),
        update_time: 1592364634,
        version: 'V009'
      },
      {
        name: 'coco/2017',
        id: 3,
        description: 'a large-scale object detection, segmentation, and captioning dataset.',
        creator:  Mock.mock('@cname'),
        update_time: 1592364634,
        version: 'V009'
      },
      {
        name: 'voc/2007',
        id: 4,
        description: 'data from the PASCAL Visual Object Classes Challenge 2007',
        creator:  Mock.mock('@cname'),
        update_time: 1592364634,
        version: 'V009'
      },
      {
        name: 'voc/2012',
        id: 5,
        description: 'data from the PASCAL Visual Object Classes Challenge 2012',
        creator:  Mock.mock('@cname'),
        update_time: 1592364634,
        version: 'V009'
      }]
    };
    if (successful === 'true') {
      setDataSets({
        data: dataSets,
        total: totalCount,
      });
    }
  };

  const pageParamsChange = (page, count) => {
    setPageParams({ page: page, count: count });
  };

  const onSubmit = () => {
    // form.validateFields()
    //   .then(async (values) => {
    //     if (modalType === 'new') {
    //       await submit(values);
    //     } else if (modalType === 'edit') {
    //       await edit(editData, values);
    //     }
    //     message.success('提交成功！');
    //     resetModal(false);
    //     getData();
    //   })
    //   .catch((info) => {
    //     message.error('提交失败！');
    //     console.log('Validate Failed:', info);
    //   });
  };

  const columns = [
    {
      title: 'Dataset Name',
      key: 'name',
      render: item => <Link to={{ pathname: '/data-manage/dataSetManage/detail', query: { id: item.id } }}>{item.name}</Link>,
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
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS')
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
          onOk={onSubmit}
          onCancel={() => setModalFlag(false)}
          okText="Submit"
          destroyOnClose
          maskClosable={false}
          width={600}
          className={styles.dataSetModal}
        >
          <AddModalForm ref={addModalFormRef} modalType={modalType} editData={editData}></AddModalForm>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default DataSetList;
