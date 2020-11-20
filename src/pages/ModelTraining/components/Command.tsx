import React from 'react';
import { Form, Input } from 'antd';



const { useForm, Item: FormItem } = Form;
const { TextArea } = Input;


const Command: React.FC = () => {
  const [form] = useForm();
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
  };
  return (
    <Form
      form={form}
    >
      <FormItem label="命令行" name="command" {...layout}>
        <TextArea style={{ width: '500px' }} rows={4} />
      </FormItem>
    </Form>
  )
}

export default Command;