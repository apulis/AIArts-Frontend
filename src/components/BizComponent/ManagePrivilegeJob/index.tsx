import React, { useEffect, useState } from 'react';
import { Switch, Input, Form, Button, message, Card } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useIntl } from 'umi';

import { fetchPrivilegeJobConfig, submitPrivilegeJobConfig } from '@/services/privilegeJob';
import { format } from 'prettier';

const FormItem = Form.Item;
const { useForm } = Form;

interface IPrivilegeJobConfig {
  isEnable: boolean;
  bypassCode: string
}

const ManagePrivilegeJob: React.FC = () => {
  const [form] = useForm();
  const { formatMessage } = useIntl();
  const { validateFields, setFieldsValue } = form;
  const [privilegeConfig, setPrivilegeConfig] = useState<IPrivilegeJobConfig | undefined>(undefined);

  const getPrivilegeConfig = async () => {
    const res = await fetchPrivilegeJobConfig();
    if (res.code === 0) {
      const { isEnable, bypassCode } = res.data;
      setPrivilegeConfig({
        isEnable: isEnable,
        bypassCode: bypassCode,
      });
      setFieldsValue({
        isEnable,
        bypassCode,
      });
    }
  }
  useEffect(() => {
    getPrivilegeConfig();
  }, [])

  const handleSubmit = async () => {
    const result = await validateFields();
    const res = await submitPrivilegeJobConfig(result as IPrivilegeJobConfig);
    if (res.code === 0) {
      message.success(formatMessage({ id: 'bizComponent.ManagePrivilegeJob.update.success' }));
      getPrivilegeConfig();
    }
  }
  return (
    <Card
      title={formatMessage({ id: 'bizComponent.ManagePrivilegeJob.title.privilege.config' })}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
      >
        <FormItem
          rules={[
            { required: true }
          ]}
          name="isEnable"
          label={formatMessage({ id: 'bizComponent.ManagePrivilegeJob.form.enablePrivilege' })}
          valuePropName="checked"
        >
          <Switch />
        </FormItem>
        
        <FormItem
          rules={[
            { required: true }
          ]}
          name="bypassCode"
          label={formatMessage({ id: 'bizComponent.ManagePrivilegeJob.form.bypascode' })}
        >
        
          <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} style={{ width: '200px' }} />
        </FormItem>
        <Button type="primary" htmlType="submit">
          {formatMessage({ id: 'bizComponent.ManagePrivilegeJob.button.confirm' })}
        </Button>
      </Form>
      
    </Card>
    
  )
}

export default ManagePrivilegeJob;