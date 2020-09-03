import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Select, Button, Form, message } from 'antd';
import { connect } from 'dva';

const { Option } = Select;

const FormItem = Form.Item;

const Setting = ({ common, dispatch }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  const changeInterval = async () => {
    const result = await validateFields(['interval']);
    const { interval } = result;
    if (typeof interval !== 'undefined') {
      dispatch({
        type: 'common/changeInterval',
        payload: interval,
      })
      message.success('设置成功');
    }
  }

  const defaultInterval = common.interval === null ? 0 : common.interval;
  return (
    <PageHeaderWrapper>
      <div style={{width: '100%'}}>
        <Form
          form={form}
          {...commonLayout}
        >
          <FormItem name="interval" label="页面数据刷新时间">
            <Select style={{ width: 120 }} defaultValue={defaultInterval}>
              {[0, 3, 5, 10, 30].map(val => val * 1000).map(val => (
                <Option value={val}>{(val || 0) / 1000}秒</Option>
              ))}
            </Select>
          </FormItem>
          <Form.Item wrapperCol={{ ...commonLayout.wrapperCol, offset: 3 }}>
            <Button type="primary" onClick={changeInterval} style={{ marginLeft: '40px' }}>确定</Button>
          </Form.Item>
        </Form>
        
        
        </div>

    </PageHeaderWrapper>
  )
}



export default connect(({ common }) => ({ common }))(Setting);