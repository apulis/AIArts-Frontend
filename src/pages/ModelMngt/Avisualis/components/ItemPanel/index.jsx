import { message, Form, Input, Button, Select, Descriptions, InputNumber } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
import styles from './index.less'; 
import { history, useDispatch } from 'umi';
import { submitAvisualis } from '../../service';
import { connect } from 'dva';
import { MODELSTYPES } from '@/utils/const';
import _ from 'lodash';

const { Option } = Select;

const ItemPanel = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { avisualis, flowChartData, selectItem, setFlowChartData, id } = props;
  const { addFormData, panelApiData } = avisualis;
  const [btnLoading, setBtnLoading] = useState(false);

  const onSubmit = async() => {
    const { nodes, edges } = flowChartData;
    if (nodes.length !== panelApiData.panel.length) {
      message.warning('请完成剩余步骤！');
      return;
    }
    setBtnLoading(true);
    const _addFormData = _.cloneDeep(addFormData);
    const _flowChartData = _.cloneDeep(flowChartData);
    if (_addFormData.deviceType === 'PSDistJob') {
      _addFormData.numPs = 1;
      _addFormData.deviceNum = _addFormData.deviceTotal;
    }
    _addFormData.datasetPath = nodes[0].config[0].value;
    _addFormData.outputPath = nodes[nodes.length - 1].config[0].value;
    _addFormData.paramPath = _addFormData.outputPath;
    const newNodes = nodes.map(i => {
      return {
        ...i,
        id: i.id.split('-')[0]
      }
    });
    const newEdges = edges.map(i => {
      const { source, target } = i;
      return {
        source: source,
        target: target
      }
    });
    const { code, data } = await submitAvisualis({
      ..._addFormData,
      nodes: newNodes,
      edges: newEdges,
    });
    if (code === 0) {
      message.success('创建成功！');
      dispatch({
        type: 'avisualis/saveData',
        payload: {
          addFormData: {}
        }
      });
      history.push('/ModelManagement/avisualis');
    }
    setBtnLoading(false);
  }

  const getConfig = () => {
    const { config } = selectItem._cfg.model;
    return config.map(i => {
      const { type, value, key, options } = i;
      if (type === 'string' || type === 'disabled') {
        return (
        <Form.Item name={key} label={key} initialValue={value} rules={[{ required: true, message: `请输入${key}` }]}>
          <Input placeholder={`请输入${key}`} disabled={type === 'disabled'} />
        </Form.Item>)
      } else if (type === 'number') {
        return (
        <Form.Item name={key} label={key} initialValue={value} rules={[{ required: true, message: `请输入${key}` }]}>
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>)
      } else if (type === 'select') {
        return (
        <Form.Item name={key} label={key} initialValue={value} rules={[{ required: true, message: `请选择${key}！` }]}>
          <Select placeholder="请选择">
            {options.map(o => <Option key={o} value={o}>{o}</Option>)}
          </Select>
        </Form.Item>)
      }
    }) 
  }

  const onSaveConfig = () => {
    form.validateFields().then(async (values) => {
      const newValues = Object.keys(values).map(i => values[i]);
      const cloneData = _.cloneDeep(flowChartData);
      const selectIdx = selectItem._cfg.model.idx;
      cloneData.nodes[selectIdx].config.forEach((m, n) => {
        m.value = newValues[n];
      });
      setFlowChartData(cloneData);
      message.success('保存成功！');
    })
  }

  const getMODELSTYPESText = () => {
    const data = MODELSTYPES.find(i => i.val === addFormData.use);
    return data ? data.text : '--';
  }
  
  return (
    <div className={styles.itemPanelWrap}>
      <div className={styles.btnWrap}>
        <Button onClick={() => history.push(`/ModelManagement/avisualis`)}>返回</Button>
        <Button type="primary" loading={btnLoading} onClick={onSubmit}>{id ? '保存模型' : '创建模型'}</Button>
      </div>
      {selectItem ?
        <>
          <div className="ant-descriptions-title">节点配置</div>
          <Form form={form}>
            {getConfig()}
          </Form>
          <Button type="primary" onClick={onSaveConfig} style={{ marginLeft: 16, float: 'right' }}>保存配置</Button>
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