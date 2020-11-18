import React, { useState, useEffect, forwardRef } from 'react';
import moment from 'moment';
import { Modal, Form, DatePicker, Input, Table } from 'antd';
import styles from './index.less';
import { PAGEPARAMS } from '@/utils/const';
import { connect } from 'umi';
import { getNameFromDockerImage } from '@/utils/reg';
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
    vc
  } = props;

  const [pageParams, setPageParams] = useState(PAGEPARAMS);
  const { currentSelectedVC } = vc;
  const [current, setCurrent] = useState(undefined);
  useEffect(() => {
    dispatch({
      type: 'jobList/fetch',
      payload: {
        pageNum: pageParams.pageNum,
        pageSize: 5,
        status: 'finished',
        vcName: currentSelectedVC,
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
    okText: intl.formatMessage({ id: 'createModel.modalFooter.okText' }),
    onOk: handleSubmit,
    cancelText: intl.formatMessage({ id: 'createModel.modalFooter.cancelText' }),
    onCancel,
  };

  const jobColumns = [
    {
      title: intl.formatMessage({ id: 'createModel.table.label.name' }),
      dataIndex: 'name',
      ellipsis: true,
      width: 100,
    },
    {
      title: intl.formatMessage({ id: 'createModel.table.label.engine' }),
      dataIndex: 'engine',
      ellipsis: true,
      width: 100,
      render(value) {
        return <div>{getNameFromDockerImage(value)}</div>;
      },
    },
    {
      title: intl.formatMessage({ id: 'createModel.table.label.desc' }),
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
          total: data.pagination.total,
          onChange: (page) => {
            dispatch({
              type: 'jobList/fetch',
              payload: {
                pageNum: page,
                pageSize: 5,
                status: 'finished',
              },
            });
          },
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
      title={intl.formatMessage({ id: 'createModel.title' })}
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

export default connect(({ jobList, loading, vc }) => ({
  jobList,
  loading: loading.models.jobList,
  vc,
}))(TrainingJobModal);
