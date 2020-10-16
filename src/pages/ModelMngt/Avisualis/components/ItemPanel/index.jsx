import { message, Form, Input, Button, Select, Descriptions, InputNumber, Modal } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
import styles from './index.less';
import { history, useDispatch, useIntl } from 'umi';
import { submitAvisualis, patchAvisualis } from '../../service';
import { connect } from 'dva';
import { MODELSTYPES } from '@/utils/const';
import _ from 'lodash';
import AddFormModal from '../AddFormModal';

const { Option } = Select;

const ItemPanel = (props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const addFormModalRef = useRef();
  const { avisualis, flowChartData, selectItem, setFlowChartData, detailId, onChangeNode } = props;
  const { addFormData, treeData } = avisualis;
  const [btnLoading1, setBtnLoading1] = useState(false);
  const [btnLoading2, setBtnLoading2] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [changeNodeOptions, setChangeNodeOptions] = useState([]);
  const [changeNodeKey, setChangeNodeKey] = useState({});
  const intl = useIntl();
  const hasSelectItem =
    selectItem &&
    selectItem._cfg &&
    selectItem._cfg.model.config &&
    selectItem._cfg.model.config.length > 0;

  useEffect(() => {
    if (selectItem) {
      const { id, treeIdx } = selectItem._cfg.model;
      if (treeIdx === 0 || treeIdx > 0) {
        const child = treeData[treeIdx].children;
        setChangeNodeOptions(child.filter((i) => i.key !== id));
      }
    }
  }, [selectItem]);

  const onSubmit = async (isSvaeTPL) => {
    addFormModalRef.current.form.validateFields().then(async (values) => {
      const { nodes, edges, combos } = flowChartData;
      if (!nodes || (nodes && Math.max(...nodes.map((i) => i.treeIdx)) < treeData.length - 1)) {
        message.warning('请完成剩余步骤！');
        return;
      }
      isSvaeTPL ? setBtnLoading1(true) : setBtnLoading2(true);
      const _values = _.cloneDeep(values);
      if (_values.deviceType === 'PSDistJob') {
        _values.numPs = 1;
        _values.deviceNum = _values.deviceTotal;
      }
      _values.datasetPath = nodes[0].config[0].value;
      _values.outputPath = nodes[nodes.length - 1].config[0].value;
      _values.paramPath = _values.outputPath;
      const newEdges = edges.map((i) => {
        const { source, target, sourceAnchor, targetAnchor } = i;
        return {
          source: source,
          target: target,
          sourceAnchor: sourceAnchor || 1,
          targetAnchor: targetAnchor || 0,
        };
      });
      let submitData = {
        ...addFormData,
        ..._values,
        isAdvance: isSvaeTPL ? true : false,
        params: {
          ...addFormData.params,
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(newEdges),
          combos: JSON.stringify(combos),
        },
      };
      if (!detailId) delete submitData.id;
      const { code, data } = detailId
        ? await patchAvisualis(detailId, submitData)
        : await submitAvisualis(submitData);
      if (code === 0) {
        message.success(`${detailId || isSvaeTPL ? '保存' : '创建'}成功！`);
        dispatch({
          type: 'avisualis/saveData',
          payload: {
            addFormData: {},
          },
        });
        history.push('/ModelManagement/avisualis');
      }
      isSvaeTPL ? setBtnLoading1(false) : setBtnLoading2(false);
    });
  };

  const getConfig = () => {
    const { config, id } = selectItem._cfg.model;
    return config.map((i) => {
      const { type, value, key, options } = i;
      if (type === 'string' || type === 'disabled') {
        return (
          <Form.Item
            key={key}
            name={key}
            label={key}
            initialValue={value}
            rules={[{ required: true, message: `${intl.formatMessage({ id: 'itemPanel.input'})}${key}` }]}
          >
            <Input
              placeholder={`${intl.formatMessage({ id: 'itemPanel.input' })}${key}`}
              disabled={type === 'disabled'}
              value={value}
            />
          </Form.Item>
        );
      } else if (type === 'number') {
        return (
          <Form.Item
            key={key}
            name={key}
            label={key}
            initialValue={value}
            rules={[
              { required: true, message: `${intl.formatMessage({ id: 'itemPanel.input' })}${key}` },
            ]}
          >
            <InputNumber style={{ width: '100%' }} value={value} />
          </Form.Item>
        );
      } else if (type === 'select') {
        return (
          <Form.Item
            key={key}
            name={key}
            label={key}
            initialValue={value}
            rules={[
              {
                required: true,
                message: `${intl.formatMessage({ id: 'itemPanel.select' })}${key}！`,
              },
            ]}
          >
            <Select placeholder={intl.formatMessage({ id: 'itemPanel.select' })} value={value}>
              {options.map((o) => (
                <Option key={o} value={o}>
                  {o}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      }
    });
  };

  const onSaveConfig = () => {
    form.validateFields().then(async (values) => {
      const newValues = Object.keys(values).map((i) => values[i]);
      const cloneData = _.cloneDeep(flowChartData);
      const { type, model } = selectItem._cfg;
      const selectId = model.id;
      let findData = [];
      type === 'combo' ? (findData = cloneData.combos) : (findData = cloneData.nodes);
      findData[findData.findIndex((i) => i.id === selectId)].config.forEach((m, n) => {
        m.value = newValues[n];
      });
      setFlowChartData(cloneData);
      message.success(intl.formatMessage({ id: 'itemPanel.save.success' }));
    });
  };

  const selectChangeNode = () => {
    if (!changeNodeKey) {
      message.warning(intl.formatMessage({ id: 'itemPanel.node.change' }));
      return;
    }
    const success = onChangeNode(changeNodeKey);
    if (success) {
      setModalFlag(false);
      message.success(intl.formatMessage({ id: 'itemPanel.node.change.success' }));
    }
  };

  return (
    <div className={styles.itemPanelWrap}>
      <div className={styles.btnWrap}>
        <Button onClick={() => history.push(`/ModelManagement/avisualis`)}>返回</Button>
        {!detailId && (
          <Button type="primary" loading={btnLoading1} onClick={() => onSubmit(true)}>
            保存模板
          </Button>
        )}
        <Button type="primary" loading={btnLoading2} onClick={() => onSubmit()}>
          {`${detailId ? '保存' : '创建'}模型`}
        </Button>
      </div>
      <Descriptions title={intl.formatMessage({ id: 'itemPanel.model.deatil' })}></Descriptions>
      <AddFormModal ref={addFormModalRef} detailData={addFormData} />
      <div className="ant-descriptions-title">{`${
        hasSelectItem ? `节点配置(${selectItem._cfg.id})` : '该节点无配置项'
      }`}</div>
      {hasSelectItem && <Form form={form}>{getConfig()}</Form>}
      <div style={{ float: 'right', textAlign: 'right' }}>
        {hasSelectItem && (
          <Button type="primary" onClick={onSaveConfig} style={{ marginRight: 16 }}>
            {intl.formatMessage({ id: 'itemPanel.config.save' })}
          </Button>
        )}
        {changeNodeOptions.length > 0 && (
          <Button type="primary" onClick={() => setModalFlag(true)}>
            {intl.formatMessage({ id: 'itemPanel.node.change' })}
          </Button>
        )}
      </div>
      {modalFlag && (
        <Modal
          title={intl.formatMessage({ id: 'itemPanel.node.change' })}
          visible={modalFlag}
          onCancel={() => setModalFlag(false)}
          destroyOnClose
          maskClosable={false}
          footer={[
            <Button onClick={() => setModalFlag(false)}>
              {intl.formatMessage({ id: 'itemPanel.cancel' })}
            </Button>,
            <Button type="primary" onClick={selectChangeNode}>
              {intl.formatMessage({ id: 'itemPanel.change' })}
            </Button>,
          ]}
        >
          <Select
            placeholder={intl.formatMessage({ id: 'itemPanel.node.select' })}
            style={{ width: '100%' }}
            onChange={(v) => setChangeNodeKey(v)}
          >
            {changeNodeOptions.map((i) => (
              <Option value={`${i.treeIdx}-${i.key}`}>{i.title}</Option>
            ))}
          </Select>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ avisualis }) => ({ avisualis }))(ItemPanel);
