import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Select, Button, Form } from 'antd';
import { connect } from 'dva';

const { Option } = Select;

const FormItem = Form.Item;

const Setting = ({ common, dispatch }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const commonLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  };
  const changeInterval = async () => {
    const result = await validateFields(['interval']);
    const { interval } = result;
    if (typeof interval !== 'undefined') {
      dispatch({
        type: 'common/changeInterval',
        payload: interval,
      })
    }
  }
  const defaultInterval = common.interval === null ? 0 : common.interval;
  return (
    <PageHeaderWrapper>
      <div>
        <h2>数据刷新时间配置</h2>
        <Form
          form={form}
          {...commonLayout}
        >
          <FormItem name="interval">
            <Select style={{ width: 120 }} defaultValue={defaultInterval}>
              {[0, 3, 5, 10, 30].map(val => val * 1000).map(val => (
                <Option value={val}>{(val || 0) / 1000}秒</Option>
              ))}
            </Select>
          </FormItem>
        </Form>
        
        
        <Button type="primary" onClick={changeInterval} style={{ marginLeft: '40px' }}>确定</Button>
        </div>

    </PageHeaderWrapper>
  )
}



export default connect(({ common }) => ({ common }))(Setting);