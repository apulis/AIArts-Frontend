import React, { useEffect, useState } from 'react';
import { Switch, Input, Form, Button, message, Card } from 'antd';
import { fetchPrivilegeJobConfig, submitPrivilegeJobConfig } from '@/services/privilegeJob';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const FormItem = Form.Item;
const { useForm } = Form;

interface IPrivilegeJobConfig {
  isEnable: boolean;
  bypassCode: string
}

const ManagePrivilegeJob: React.FC = () => {
  const [form] = useForm();
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
      console.log({ isEnable, bypassCode })
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
      message.success('修改成功');
      getPrivilegeConfig();
    }
  }
  return (
    <Card
      title="Privilege Job 设置"
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
          label="是否启用 Privilege Job"
        >
          <Switch />
        </FormItem>
        
        <FormItem
          rules={[
            { required: true }
          ]}
          name="bypassCode"
          label="Privilege 校验码"
        >
        
          <Input.Password iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} style={{ width: '200px' }} />
        </FormItem>
        <Button type="primary" htmlType="submit">
          确定
        </Button>
      </Form>
      
    </Card>
    
  )
}

export default ManagePrivilegeJob;