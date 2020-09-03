import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Select, Button, Form } from 'antd';
import { connect } from 'dva';

const { Option } = Select;

const FormItem = Form.Item;

const Setting = ({ common, dispatch }) => {
  const form = Form.useForm();
  const { validateFields } = form;
  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  };
  const changeInterval = async () => {
    const result = await validateFields(['interval'])
    console.log('result', result)
  }
  return (
    <PageHeaderWrapper>
      <div>
        <h2>数据刷新时间配置</h2>
        <Form
          // form={form}
          {...commonLayout}
        >
          <FormItem name="interval">
            <Select style={{ width: 120 }} defaultValue={common.interval}>
              {[0, 3, 5, 10, 30].map(val => (
                <Option value={val * 1000}>{val}秒</Option>
              ))}
            </Select>
          </FormItem>
        </Form>
        
        
        <Button type="primary" onChange={changeInterval} style={{ marginLeft: '40px' }}>确定</Button>
        </div>

    </PageHeaderWrapper>
  )
}



export default connect(({ common }) => ({ common }))(Setting);