import React, { useEffect, useState } from 'react';
import { Switch, Input, Form, Button } from 'antd';
import { fetchPrivilegeJobConfig, submitPrivilegeJobConfig } from '@/services/privilegeJob';

const FormItem = Form.Item;

interface IPrivilegeJobConfig {
  isEnable?: boolean;
  bypasscode?: string
}

const ManagePrivilegeJob: React.FC = () => {
  const [form] = Form.useForm();
  const { validateFields, setFieldsValue } = form;
  const [privilegeConfig, setPrivilegeConfig] = useState<IPrivilegeJobConfig>({});

  const getPrivilegeConfig = async () => {
    const res = await fetchPrivilegeJobConfig();
    if (res.code === 0) {
      const { isEnable, bypasscode } = res.data;
      setPrivilegeConfig({
        isEnable: isEnable,
        bypasscode: bypasscode,
      });
      setFieldsValue({
        isEnable,
        bypasscode,
      })
    }
  }
  useEffect(() => {
    getPrivilegeConfig();
  }, [])

  const handleSubmit = async () => {
    const result = await validateFields();
    const res = await submitPrivilegeJobConfig(result as IPrivilegeJobConfig)
  }
  return (
    <Form
      form={form}
    >
      <FormItem
        rules={[
          { required: true }
        ]}
        label="是否启用 Privilege Job"
      >
        <Switch />
      </FormItem>
      
      <FormItem
        rules={[
          { required: true }
        ]}
        label="Privilege 校验码"
      >
      
        <Input style={{ width: '200px' }} />
      </FormItem>
      
      <Button onClick={handleSubmit} type="primary">确定</Button>
    </Form>
  )
}

export default ManagePrivilegeJob;