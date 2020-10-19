import React, { useState, useEffect, forwardRef } from 'react';
import moment from 'moment';
import { Modal, Form, DatePicker, Input, Table } from 'antd';
import styles from './index.less';
import { PAGEPARAMS } from '@/utils/const';
import { connect } from 'umi';
import { useIntl } from 'umi';

const TrainingJobModal = (props) => {
  const intl = useIntl();
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
    okText: intl.formatMessage({ id: 'CreatePretrained.modalFooter.okText' }),
    onOk: handleSubmit,
    cancelText: intl.formatMessage({ id: 'CreatePretrained.modalFooter.cancelText' }),
    onCancel,
  };

  const jobColumns = [
    {
      title: intl.formatMessage({ id: 'CreatePretrained.table.label.name' }),
      dataIndex: 'name',
      ellipsis: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'CreatePretrained.table.label.engine' }),
      dataIndex: 'engine',
      ellipsis: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'CreatePretrained.table.label.desc' }),
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
      title={intl.formatMessage({ id: 'CreatePretrained.title' })}
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
