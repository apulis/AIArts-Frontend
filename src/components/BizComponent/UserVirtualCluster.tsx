import React, { useState, useEffect, CSSProperties } from 'react';
import { Select, Form, Button, message } from 'antd';
import { connect } from 'dva'; 
import { useIntl } from 'umi';
import { ConnectProps, ConnectState, UserStateType } from '@/models/connect';
import { VCStateType } from '@/models/vc';

const { Option } = Select;

interface IUserVirtualClusterProps extends Partial<ConnectProps> {
  vc: VCStateType;
  style?: CSSProperties;
  user: UserStateType;
}

const UserVirtualCluster: React.FC<IUserVirtualClusterProps> = ({ dispatch, vc, user, style }) => {
  const [form] = Form.useForm();
  const { currentVC } = user.currentUser;
  const { formatMessage } = useIntl();
  useEffect(() => {
    if (vc.currentSelectedVC && currentVC.includes(vc.currentSelectedVC)) {
      form.setFieldsValue({
        vcName: vc.currentSelectedVC,
      });
    } else if (currentVC.length > 0) {
      form.setFieldsValue({
        vcName: currentVC[0],
      });
    }
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, [vc])
  
  const onFinish = async () => {
    const { vcName } = await form.validateFields(['vcName']);
    if (vcName) {
      dispatch({
        type: 'vc/userSelectVC',
        payload: {
          vcName,
        }
      })
      message.success(formatMessage({ id: 'vc.component.message.success.set.default.vc' }));
    }
  }

  return (
    <Form
      form={form}
      onFinish={onFinish}
      layout="inline"
      style={{ paddingTop: '10px', paddingBlock: '10px', ...style }}
    >
      <Form.Item
        label={formatMessage({ id: 'vc.component.default.vc.label' })}
        name="vcName"
      >
        <Select showSearch style={{ width: '200px' }}>
          {
            currentVC.map(val => (
              <Option value={val}>{val}</Option>
            ))
          }
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" style={{ marginLeft: '40px' }}>
          {formatMessage({ id: 'vc.component.confirm' })}
        </Button>
      </Form.Item>
    </Form>
  )

}



export default connect(({ vc, user }: ConnectState) => ({ vc, user }))(UserVirtualCluster);