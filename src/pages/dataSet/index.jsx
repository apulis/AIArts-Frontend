import { message, Table, Modal, Form, Input, Button } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { getProject, deleteProject, submit, edit } from './service';
import { PAGEPARAMS } from '../../const';
import styles from './index.less';
import { Link } from 'umi';
import Mock from 'mockjs';

const DataSetList = () => {
  const [dataSets, setDataSets] = useState({ data: [], total: 0 });
  const [modalFlag, setModalFlag] = useState(false);
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [form] = Form.useForm();

  useEffect(() => {
    getData();
  }, [pageParams]);

  const getData = async () => {
    const { page, size } = pageParams;
    // const { successful, projects, msg, totalCount } = await getProject(page, size);
    const { successful, dataSets, msg, totalCount } = {
      successful: 'true',
      totalCount: 5,
      dataSets: [{
        name: 'MNIST',
        id: 1,
        desc: 'THE MNIST DATABASE of handwritten digits',
        Creator:  Mock.mock('@cname'),
        time: '2020-05-29 15:44:46',
        version: 'V009'
      },
      {
        name: 'coco/2014',
        id: 2,
        desc: 'a large-scale object detection, segmentation, and captioning datas',
        Creator:  Mock.mock('@cname'),
        time: '2020-05-29 15:44:46',
        version: 'V009'
      },
      {
        name: 'coco/2017',
        id: 3,
        desc: 'a large-scale object detection, segmentation, and captioning dataset.',
        Creator:  Mock.mock('@cname'),
        time: '2020-05-29 15:44:46',
        version: 'V009'
      },
      {
        name: 'voc/2007',
        id: 4,
        desc: 'data from the PASCAL Visual Object Classes Challenge 2007',
        Creator:  Mock.mock('@cname'),
        time: '2020-05-29 15:44:46',
        version: 'V009'
      },
      {
        name: 'voc/2012',
        id: 5,
        desc: 'data from the PASCAL Visual Object Classes Challenge 2012',
        Creator:  Mock.mock('@cname'),
        time: '2020-05-29 15:44:46',
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

  const pageParamsChange = (page, size) => {
    setPageParams({ page: page, size: size });
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
      dataIndex: 'desc',
      ellipsis: true,
      width: 350,
    },
    {
      title: 'Creator',
      dataIndex: 'Creator',
    },
    {
      title: 'Update Time',
      dataIndex: 'time',
    },
    {
      title: 'Update Version',
      dataIndex: 'version',
    },
    {
      title: 'Operation',
      render: item => <a onClick={() => onEditClick(item)}>Modify</a>,
    },
  ];

  const onEditClick = (item) => {
    form.setFieldsValue(item);
    setModalFlag(true);
  };

  return (
    <PageHeaderWrapper title={false}>
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
          title='Modify DataSet'
          visible={modalFlag}
          onOk={onSubmit}
          onCancel={() => setModalFlag(false)}
          okText="Submit"
          destroyOnClose
          maskClosable={false}
        >
          <Form form={form} className={styles.dataSetModal}>
            <Form.Item
              label="Dataset Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Description"
              name="desc"
              rules={[{ required: true, message: 'Description is required！' }]}
            >
              <Input.TextArea placeholder="please enter description" autoSize={{ minRows: 4 }} />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </PageHeaderWrapper>
  );
};

export default DataSetList;
