import React, { useState, useEffect, forwardRef } from 'react';
import moment from 'moment';
import { Modal, Form, DatePicker, Input, Table } from 'antd';
import styles from './index.less';
import { PAGEPARAMS } from '@/utils/const';
import { connect } from 'umi';

const TrainingJobModal = (props) => {
  const {
    loading,
    dispatch,
    jobList: { data },
    onCancel,
    onSubmit,
    visible = true,
  } = props;

  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const [current, setCurrent] = useState(undefined);

  useEffect(() => {
    dispatch({
      type: 'jobList/fetch',
      payload: {
        pageNum: pageParams.pageNum,
        pageSize: 5,
        //TODO: JobStatus == finished
        // JobStatus: 5?
      },
    });
  }, [pageParams]);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(current);
    }
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setCurrent(selectedRows[0]);
    },
    // getCheckboxProps: record => ({
    //   name: record.name,
    // }),
  };

  const modalFooter = {
    okText: '确定',
    onOk: handleSubmit,
    cancelText: '取消',
    onCancel,
  };

  const jobColumns = [
    {
      title: '作业名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 100,
    },
    {
      title: '引擎类型',
      dataIndex: 'engine',
      ellipsis: true,
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      ellipsis: true,
      width: 150,
    },
  ];

  const getModalContent = () => {
    return (
      <Table
        style={{
          marginBottom: 24,
        }}
        pagination={{
          style: {
            marginBottom: 0,
          },
          pageSize: 5,
        }}
        loading={loading}
        dataSource={data.list}
        columns={jobColumns}
        rowKey="id"
        rowSelection={{
          type: 'radio',
          ...rowSelection,
        }}
      />
    );
  };

  return (
    <Modal
      title="请选择训练作业"
      className={styles.standardListForm}
      width={640}
      bodyStyle={{
        padding: '28px 0 0',
      }}
      destroyOnClose
      centered
      visible={visible}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default connect(({ jobList, loading }) => ({
  jobList,
  loading: loading.models.jobList,
}))(TrainingJobModal);
