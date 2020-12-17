import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Select, Button, Form, message } from 'antd';
import { connect } from 'dva';
import { FormattedMessage } from 'umi';
import UserVirtualCluster from '@/components/BizComponent/UserVirtualCluster';
import { ConnectProps, ConnectState } from '@/models/connect';
import ManagePrivilegeJob from '@/components/BizComponent/ManagePrivilegeJob';

const { Option } = Select;

const FormItem = Form.Item;

const Setting: React.FC<ConnectProps> = ({ common, dispatch, user }) => {
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
  console.log('user', user.currentUser.permissionList)
  const currentUser = user.currentUser;
  return (
    <PageHeaderWrapper>
      <div style={{ width: '100%', paddingBottom: '20px' }}>
        <h1>个人设置</h1>
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
        {/* {
          currentUser?.permissionList.includes('MANAGE_PRIVILEGE_JOB') && */}
          <>
            <h1>系统设置</h1>
            <ManagePrivilegeJob />
          </>
        {/* } */}
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ common, user }: ConnectState) => ({ common, user }))(Setting);
