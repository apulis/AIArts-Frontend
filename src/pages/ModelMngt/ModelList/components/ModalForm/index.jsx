import React, { useEffect, forwardRef } from 'react';
// import moment from 'moment';
import { Modal, Form, DatePicker, Input } from 'antd';
import styles from './index.less';
import { useIntl } from 'umi';

const { TextArea } = Input;
const formLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 13,
  },
};

const ModalForm = (props) => {
  const intl = useIntl();
  const [form] = Form.useForm();
  const { visible = true, current, onCancel, onSubmit } = props;
  useEffect(() => {
    if (form && !visible) {
      form.resetFields();
    }
  }, [props.visible]);
  useEffect(() => {
    if (current) {
      form.setFieldsValue({
        ...current,
        // latestTime: current.latestTime ? moment(current.latestTime) : null,
      });
    }
  }, [props.current]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = (values) => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const modalFooter = {
    okText: intl.formatMessage({ id: 'modelForm.submit' }),
    onOk: handleSubmit,
    onCancel,
  };

  const getModalContent = () => {
    return (
      <Form {...formLayout} form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label={intl.formatMessage({ id: 'modelForm.modelName' })}
          // rules={[
          //   {
          //     required: true,
          //     message: '请输入项目名称',
          //   },
          // ]}
        >
          <Input placeholder={intl.formatMessage({ id: 'Item' })} disabled />
        </Form.Item>
        {/* <Form.Item
          name="latestTime"
          label="Update Time"
          // rules={[
          //   {
          //     required: true,
          //     message: '请选择更新时间',
          //   },
          // ]}
        >
          <DatePicker
            showTime
            placeholder="Please select"
            format="YYYY-MM-DD HH:mm:ss"
            style={{
              width: '100%',
            }}
            disabled
          />
        </Form.Item>
        <Form.Item
          name="creator"
          label="Project Creator"
          // rules={[
          //   {
          //     required: true,
          //     message: '请输入项目创建人',
          //   },
          // ]}
          disabled
        >
          <Input placeholder="Please input project creator" disabled/>
        </Form.Item> */}
        <Form.Item
          name="description"
          label={intl.formatMessage({ id: 'modelForm.desc' })}
          rules={[
            {
              message: intl.formatMessage({ id: 'modelForm.desc.limit' }),
              max: 256,
            },
          ]}
        >
          <TextArea rows={4} placeholder={intl.formatMessage({ id: 'modelForm.desc.tips' })} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title={intl.formatMessage({ id: 'modelForm.updateModel' })}
      className={styles.standardListForm}
      width={640}
      bodyStyle={{
        padding: '28px 0 0',
      }}
      destroyOnClose
      visible={visible}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default ModalForm;
