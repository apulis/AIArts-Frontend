import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Select, Button, Form, message } from 'antd';
import { connect } from 'dva';
import { FormattedMessage } from 'umi';
import UserVirtualCluster from '@/components/BizComponent/UserVirtualCluster';
import { ConnectProps, ConnectState } from '@/models/connect';

const { Option } = Select;

const FormItem = Form.Item;

const Setting: React.FC<ConnectProps> = ({ common, dispatch }) => {
  const [form] = Form.useForm();
  const { validateFields } = form;
  const commonLayout = {
    labelCol: { span: 12 },
    wrapperCol: { span: 16 },
  };

  const changeInterval = async () => {
    const result = await validateFields(['interval']);
    const { interval } = result;
    if (typeof interval !== 'undefined') {
      dispatch({
        type: 'common/changeInterval',
        payload: interval,
      });
      message.success(<FormattedMessage id="setting.message.success" />);
    }
  };

  const defaultInterval = common.interval === null ? 0 : common.interval;
  return (
    <PageHeaderWrapper>
      <div style={{ width: '100%', paddingBottom: '20px' }}>
        <Form form={form} layout="inline">
          <FormItem
            name="interval"
            label={<FormattedMessage id="setting.form.label.refresh.interval" />}
          >
            <Select style={{ width: 200 }} defaultValue={defaultInterval}>
              {[0, 3, 5, 10, 30]
                .map((val) => val * 1000)
                .map((val) => (
                  <Option value={val}>
                    {(val || 0) / 1000}
                    {<FormattedMessage id="setting.second" />}
                  </Option>
                ))}
            </Select>
          </FormItem>
          <Form.Item>
            <Button type="primary" onClick={changeInterval} style={{ marginLeft: '40px' }}>
              <FormattedMessage id="setting.button.confirm" />
            </Button>
          </Form.Item>
        </Form>
        <UserVirtualCluster style={{ marginTop: '20px' }} />
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ common }: ConnectState) => ({ common }))(Setting);