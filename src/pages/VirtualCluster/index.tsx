import React, { useEffect, useReducer, useState } from 'react';
import { Table, Button, Modal, Form } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { ColumnProps } from 'antd/lib/table';

import { createVC, checkActiveJob, fetchVCList, deleteVC  } from '@/services/vc';
import { jobNameReg } from '@/utils/reg';


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


const VirtualCluster: React.FC = () => {

  const [vcList, setVCList] = useState([{name: 'aaa'}]);
  const [createVCModalVisible, setCreateVCModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [paginationState, setPaginationState] = useReducer((state: IPaginationParams, action: IPaginationParams) => ({...state, ...action}), { pageSize: 1, pageNum: 10, search: '', total: 10 });
  const handleCreateVC = () => {
    
  }

  const getVCList = () => {
    // const res = 
  }

  useEffect(() => {
    setVCList
  }, [paginationState])

  const columns: ColumnProps<IVCColumnsProps>[] = [
    {
      title: 'VC Name',
      dataIndex: 'vcName',
    },
    {
      title: 'Device Type',
    },
    {
      title: 'Device Amount',
    },
    {
      title: 'MaxAvailable',
    },
    {
      title: 'User Amount',
    },
    {
      title: 'Operation',
      align: 'center',
      render() {
        return (
          <>
            <Button type="link">
              Modify
            </Button>
            <Button danger type="link">
              Delete
            </Button>
          </>
        )
      }
    },

  ]

  return (
    <PageHeaderWrapper>
      <div style={{ marginBottom: '20px' }}>
        <Button type="primary" onClick={() => setCreateVCModalVisible(true)}>
          Create Virtaul Cluster
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={vcList}
        pagination={{
          total: paginationState.total,
          pageSize: paginationState.pageSize,
          current: paginationState.pageNum,
        }}
      />
      <Modal
        forceRender
        visible={createVCModalVisible}
        onCancel={() => setCreateVCModalVisible(false)}
        onOk={handleCreateVC}
      >
        <Form
          form={form}
        >
          <FormItem name="vcName" label="vcName" rules={[{ required: true }, { ...jobNameReg }]}>

          </FormItem>
        </Form>

      </Modal>
    </PageHeaderWrapper>
  )
}


export default VirtualCluster;