import React, { useEffect, forwardRef } from 'react';
import moment from 'moment';
import { Modal, Form, DatePicker, Input } from 'antd';
import styles from './index.less';

const { TextArea } = Input;
const formLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 13,
  },
};

const ModalForm = props => {
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
        latestTime: current.latestTime ? moment(current.latestTime) : null,
      });
    }
  }, [props.current]);

  const handleSubmit = () => {
    if (!form) return;
    form.submit();
  };

  const handleFinish = values => {
    if (onSubmit) {
      onSubmit(values);
    }
  };

  const modalFooter = 
    {
      okText: '保存',
      onOk: handleSubmit,
      onCancel,
    };

  const getModalContent = () => {
    return (
      <Form {...formLayout} form={form} onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="实验名称"
          // rules={[
          //   {
          //     required: true,
          //     message: '请输入实验名称',
          //   },
          // ]}
        >
          <Input placeholder="请输入实验名称" disabled/>
        </Form.Item>
        <Form.Item
          name="latestTime"
          label="更新时间"
          // rules={[
          //   {
          //     required: true,
          //     message: '请选择更新时间',
          //   },
          // ]}
        >
          <DatePicker
            showTime
            placeholder="请选择"
            format="YYYY-MM-DD HH:mm:ss"
            style={{
              width: '100%',
            }}
            disabled
          />
        </Form.Item>
        <Form.Item
          name="version"
          label="实验版本"
          // rules={[
          //   {
          //     required: true,
          //     message: '请输入实验版本号',
          //   },
          // ]}
        >
          <Input placeholder="请输入实验创建人" disabled/>
        </Form.Item>
        <Form.Item
          name="creator"
          label="实验创建人"
          // rules={[
          //   {
          //     required: true,
          //     message: '请输入实验创建人',
          //   },
          // ]}
        >
          <Input placeholder="请输入实验创建人" disabled/>
        </Form.Item>
        <Form.Item
          name="desc"
          label="实验描述"
          rules={[
            {
              message: '请输入至少五个字符的实验描述！',
              min: 5,
            },
          ]}
        >
          <TextArea rows={4} placeholder="请输入至少五个字符" />
        </Form.Item>
      </Form>
    );
  };

  return (
    <Modal
      title='编辑实验'
      className={styles.standardListForm}
      width={640}
      bodyStyle={
        {
          padding: '28px 0 0',
        }
      }
      destroyOnClose
      visible={visible}
      {...modalFooter}
    >
      {getModalContent()}
    </Modal>
  );
};

export default ModalForm;