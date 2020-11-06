import React, { useEffect, useReducer, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { ColumnProps } from 'antd/lib/table';
import { useIntl } from 'umi';
import { connect } from 'dva';
import { createVC, checkActiveJob, fetchVCList, deleteVC } from '@/services/vc';
import { jobNameReg } from '@/utils/reg';
import EqualIcon from '@/components/Icon/Equal';
const FormItem = Form.Item;

interface IVCColumnsProps {
  name: string;
}

interface IPaginationParams {
  pageSize: number;
  pageNum: number;
  total: number;
  search: string;
}

interface IVirtualClusterProps {
  // resource: {
  //   [props: string]: 
  // }
}

export const vcNumbersPrefix = {
  deviceNumber: 'device--',
  maxAvailble: 'max--',
};

const { Search } = Input;

const VirtualCluster: React.FC = ({ resource }) => {
  const [vcList, setVCList] = useState([
    {
      name: 'aaa',
    },
  ]);
  const [createVCModalVisible, setCreateVCModalVisible] = useState<boolean>(false);
  const [modifyVCModalVisible, setModifyVCModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [paginationState, setPaginationState] = useReducer(
    (state: IPaginationParams, action: IPaginationParams) => ({ ...state, ...action }),
    {
      pageSize: 10,
      pageNum: 1,
      search: '',
      total: 10,
    }
  );
  const { formatMessage } = useIntl();
  const { devices } = resource;
  const deviceArray = Object.keys(devices);
  const { validateFields } = form;

  const handleCreateVC = async () => {
    const result = await validateFields();
    console.log('result', result);
  };

  const handleModifyVC = () => {
    //
  };

  const getVCList = () => {
    // const res =
  };

  const handleDeleteVC = () => {
    //
  };

  useEffect(() => {
    getVCList();
  }, [paginationState]);
  const columns: ColumnProps<IVCColumnsProps>[] = [
    {
      title: formatMessage({
        id: 'vc.page.table.vc.name',
      }),
      dataIndex: 'vcName',
    },
    {
      title: formatMessage({
        id: 'vc.page.table.device.type',
      }),
    },
    {
      title: formatMessage({
        id: 'vc.page.table.device.number',
      }),
    },
    {
      title: formatMessage({
        id: 'vc.page.table.max.avail',
      }),
    },
    {
      title: formatMessage({
        id: 'vc.page.table.user.amount',
      }),
    },
    {
      title: formatMessage({
        id: 'vc.page.table.max.Operation',
      }),
      align: 'center',

      render() {
        return (
          <>
            <Button type="link" onClick={() => setModifyVCModalVisible(true)}>
              {formatMessage({
                id: 'vc.page.table.button.modify',
              })}
            </Button>
            <Button danger type="link" onClick={handleDeleteVC}>
              {formatMessage({
                id: 'vc.page.table.button.delete',
              })}
            </Button>
          </>
        );
      },
    },
  ];
  const modalFormLayout = {
    labelCol: {
      span: 9,
    },
    wrapperCol: {
      span: 15,
    },
  };
  return (
    <PageHeaderWrapper>
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button type="primary" onClick={() => setCreateVCModalVisible(true)}>
          {formatMessage({
            id: 'vc.page.button.create.vitual.cluster',
          })}
        </Button>
        <Search
          style={{ width: '160px'}}
          onSearch={(s) => setPaginationState({
            ...paginationState,
            search: s,
          })}
        />
      </div>
      <Table
        columns={columns}
        dataSource={vcList}
        pagination={{
          total: paginationState.total,
          pageSize: paginationState.pageSize,
          current: paginationState.pageNum,

          onChange(page, pageSize) {
            setPaginationState({
              ...paginationState,
              pageNum: page,
              pageSize: pageSize || paginationState.pageSize,
            });
          },
        }}
      />
      {createVCModalVisible && (
        <Modal
          forceRender
          visible={createVCModalVisible}
          onCancel={() => setCreateVCModalVisible(false)}
          onOk={handleCreateVC}
          title={formatMessage({ id: 'vc.page.create.vc.modal.title' })}
        >
          <Form form={form}>
            <FormItem
              name="vcName"
              label="VC Name"
              rules={[
                {
                  required: true,
                },
                { ...jobNameReg },
              ]}
              {...modalFormLayout}
            >
              <Input
                style={{
                  width: '180px',
                }}
              />
            </FormItem>
            <FormItem label="Device Number" required {...modalFormLayout}>
              {deviceArray.map(val => (
                <>
                  <FormItem style={{ display: 'inline-block' }}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem style={{ display: 'inline-block' }} name={vcNumbersPrefix.deviceNumber + val} initialValue={0}>
                    <InputNumber min={0} />
                  </FormItem>
                </>
              ))}
            </FormItem>
            <FormItem label="Per User Max Availble" required {...modalFormLayout}>
              {deviceArray.map(val => (
                <>
                <FormItem style={{ display: 'inline-block' }}>
                  <Input style={{ width: '165px' }} value={val} disabled />
                </FormItem>
                <EqualIcon />
                <FormItem style={{ display: 'inline-block' }} name={vcNumbersPrefix.maxAvailble + val} initialValue={0}>
                  <InputNumber min={0} />
                </FormItem>
              </>
              ))}
            </FormItem>
          </Form>
        </Modal>
      )}

      <Modal
        forceRender
        visible={modifyVCModalVisible}
        onCancel={() => setModifyVCModalVisible(false)}
        onOk={handleModifyVC}
      >
        <Form form={form}>
          <FormItem
            name="vcName"
            label="vcName"
            rules={[
              {
                required: true,
              },
              { ...jobNameReg },
            ]}
          ></FormItem>
        </Form>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default connect(({ resource }) => ({
  resource,
}))(VirtualCluster);
