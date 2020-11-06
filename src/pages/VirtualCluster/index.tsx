import React, { useEffect, useReducer, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { ColumnProps } from 'antd/lib/table';
import { useIntl } from 'umi';
import { connect } from 'dva';
import { createVC, checkActiveJob, fetchVCList, deleteVC } from '@/services/vc';
import { jobNameReg } from '@/utils/reg';
import EqualIcon from '@/components/Icon/Equal';
const FormItem = Form.Item;

interface IVCMeta {
  [props: string]: {
    user_quota: number;
  }
}

interface IVCQuota {
  [props: string]: number;
}
interface IVCColumnsProps {
  vcName: string;
  meta: IVCMeta;
  quota: IVCQuota;
  userNum: number;
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
  const [vcList, setVCList] = useState<IVCColumnsProps[]>([]);
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
  const { validateFields, getFieldValue } = form;

  const handleCreateVC = async () => {
    const result = await validateFields();
  };

  const handleModifyVC = async () => {
    
    
  };

  const getVCList = async () => {
    const res = await fetchVCList<{code: number, data: { result: { vcName: string, quota: string, meta: string, userNum: number }[] }}>(paginationState.pageSize, paginationState.pageNum, paginationState.search);
    if (res.code === 0) {
      const vcList: IVCColumnsProps[] = res.data.result.map(vc => {
        return {
          ...vc,
          meta: JSON.parse(vc.meta || '{}') as IVCMeta,
          quota: JSON.parse(vc.quota || '{}') as IVCQuota,
        };
      });
      setVCList(vcList)
    }
  };

  const handleDeleteVC = (vcName: string) => {
    Modal.confirm({
      title: formatMessage({ id: 'xxxx' }),
      content: formatMessage({ id: 'xxx' }),
      onCancel() {

      },
      async onOk() {
        const res = await checkActiveJob(vcName);
        if (res.code === 0 && res.data.jobCount > 0) {
          const res = await deleteVC(vcName);
          if (res.code === 0) {
            message.success('success');
          }
        } else {
          message.warn('当前VC有JOB正在运行');
        }
      }
    })
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
      render(_text, item) {
        return Object.keys(item.quota).map(val => (
          <div>{val}</div>
        ))
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.device.number',
      }),
      align: 'center',
      render(_text, item) {
        return Object.keys(item.quota).map(val => (
          <div>{(item.quota)[val]}</div>
        ))
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.max.avail',
      }),
      align: 'center',
      render(_text, item) {
        const metas = Object.keys(item.meta)
        if (metas.length === 0) {
          return Object.keys(item.quota).map(val => (
            <div>{(item.quota)[val]}</div>
          ))
        }
        return metas.map(val => (
          <div>{(item.meta)[val].user_quota || '-'}</div>
        ))
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.user.amount',
      }),
      align: 'center',
      render(_text, item) {
        return (
          <div>{item.userNum || 0}</div>
        )
      }
    },
    {
      title: formatMessage({
        id: 'vc.page.table.max.Operation',
      }),
      align: 'center',
      render(_text, item) {
        return (
          <>
            <Button type="link" onClick={() => setModifyVCModalVisible(true)}>
              {formatMessage({
                id: 'vc.page.table.button.modify',
              })}
            </Button>
            <Button danger type="link" onClick={() => handleDeleteVC(item.name)}>
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
          style={{ width: '160px' }}
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
          width="800px"
          title={formatMessage({ id: 'vc.page.create.vc.modal.title' })}
        >
          <Form form={form}>
            <FormItem
              name="vcName"
              label={formatMessage({ id: 'vc.page.form.vc.name' })}
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
            <FormItem label={formatMessage({ id: 'vc.page.form.vc.device.number' })} required {...modalFormLayout}>
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
            <FormItem label={formatMessage({ id: 'vc.page.form.vc.per.user.max.availble.number' })} required {...modalFormLayout}>
              {deviceArray.map(val => (
                <>
                  <FormItem style={{ display: 'inline-block' }}>
                    <Input style={{ width: '165px' }} value={val} disabled />
                  </FormItem>
                  <EqualIcon />
                  <FormItem
                    style={{ display: 'inline-block' }}
                    name={vcNumbersPrefix.maxAvailble + val}
                    initialValue={0}
                    rules={[
                      {async validator() {
                        if (getFieldValue(vcNumbersPrefix.maxAvailble + val) > getFieldValue(vcNumbersPrefix.deviceNumber + val)) {
                          throw new Error(formatMessage({ id: 'vc.page.form.max.avail.rule.error' }));
                        }
                      }}
                    ]}
                  >
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
        width="800px"
      >
        <Form form={form}>
          <FormItem
            name="vcName"
            label={formatMessage({ id: 'vc.page.form.vc.name' })}
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
          <FormItem label={formatMessage({ id: 'vc.page.form.vc.device.number' })} required {...modalFormLayout}>
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
          <FormItem label={formatMessage({ id: 'vc.page.form.vc.per.user.max.availble.number' })} required {...modalFormLayout}>
            {deviceArray.map(val => (
              <>
                <FormItem style={{ display: 'inline-block' }}>
                  <Input style={{ width: '165px' }} value={val} disabled />
                </FormItem>
                <EqualIcon />
                <FormItem
                  style={{ display: 'inline-block' }}
                  name={vcNumbersPrefix.maxAvailble + val}
                  initialValue={0}
                  rules={[
                    {async validator() {
                      if (getFieldValue(vcNumbersPrefix.maxAvailble + val) > getFieldValue(vcNumbersPrefix.deviceNumber + val)) {
                        throw new Error(formatMessage({ id: 'vc.page.form.max.avail.rule.error' }));
                      }
                    }}
                  ]}
                >
                  <InputNumber min={0} max={getFieldValue(vcNumbersPrefix.maxAvailble + val)} />
                </FormItem>
              </>
            ))}
          </FormItem>
        </Form>
      </Modal>
    </PageHeaderWrapper>
  );
};

export default connect(({ resource }) => ({
  resource,
}))(VirtualCluster);
