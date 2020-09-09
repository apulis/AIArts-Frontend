import { message, Form, Input, Button, Radio, Select, Descriptions } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
import styles from './index.less'; 
import { history } from 'umi';
import { submitAvisualis } from '../../service';
import { connect } from 'dva';
import { MODELSTYPES } from '@/utils/const';

const { Option } = Select;

const ItemPanel = (props) => {
  const [form] = Form.useForm();
  const { avisualis, flowChartData, selectItem } = props;
  const { addFormData } = avisualis;

  useEffect(() => {
    getData();
  }, []);

  const getData = () => {

  }

  const onSubmit = () => {
    form.validateFields().then(async (values) => {
      if (values.deviceType === 'PSDistJob') {
        values.numPs = 1;
        values.deviceNum = values.deviceTotal;
      }
      const { nodes } = flowChartData;
      values.datasetPath = nodes[0].config.data_path;
      values.outputPath = nodes[nodes.length - 1].config.work_dir;
      console.log('----', { ...values, ...addFormData })
      const { code, data } = await submitAvisualis({ ...values, ...addFormData, ...flowChartData });
      if (code === 0) {
        message.success('创建成功！');
        history.push('/ModelManagement/avisualis');
      }
    })
  }

  const getConfig = () => {
    const { config } = selectItem._cfg.model;
    return config.map(i => {
      const { type, value, key } = i;
      if (type === 'string') {
        return (<Form.Item name={key} label={key} rules={[{ required: true, message: `请输入${key}` }]}>
          <Input placeholder={`请输入${key}`} />
        </Form.Item>)
      } else if (type === 'number') {
        return (<Form.Item name={key} label={key} rules={[{ required: true, message: `请输入${key}` }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>)
      } else if (type === 'select') {
        return (<Form.Item name={key} label={key} rules={[{ required: true, message: `请选择${key}！` }]}>
          <Select placeholder="请选择">
            {value.map(o => <Option value={o}>{o}</Option>)}
          </Select>
        </Form.Item>)
      } else if (type === 'disabled') {
        return ( <Form.Item name={key} label={key} rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>)
      }
    }) 
  }

  const onSaveConfig = () => {
    
  }

  const getMODELSTYPESText = () => {
    const data = MODELSTYPES.find(i => i.val === addFormData.use);
    return data ? data.text : '--';
  }
  
  return (
    <div className={styles.itemPanelWrap}>
      <div className={styles.btnWrap}>
        <Button onClick={() => history.push(`/ModelManagement/avisualis`)}>返回</Button>
        <Button type="primary" onClick={onSaveConfig}>创建模型</Button>
      </div>
      {selectItem ?
        <>
          <div className="ant-descriptions-title">节点配置</div>
          <Form form={form}>
            {getConfig()}
          </Form>
          <Button type="primary" onClick={onSaveConfig}  style={{ marginLeft: 16, float: 'right' }}>保存配置</Button>
        </> :
        <Descriptions column={1} title="模型详情">
        <Descriptions.Item label="模型名称">{addFormData.name || '--'}</Descriptions.Item>
        <Descriptions.Item label="模型用途">{getMODELSTYPESText()}</Descriptions.Item>
        <Descriptions.Item label="简介">{addFormData.desc || '--'}</Descriptions.Item>
      </Descriptions>}
    </div>
  );

 
};

export default connect(({ avisualis }) => ({ avisualis }))(ItemPanel);