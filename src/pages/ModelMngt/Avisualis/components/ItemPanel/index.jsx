import { message, Form, Input, Button, Select, Descriptions, InputNumber, Modal } from 'antd';
import React, { useState, useEffect, useRef, useForm } from 'react';
import styles from './index.less';
import { history, useDispatch } from 'umi';
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
  const [btnLoading, setBtnLoading] = useState(false);
  const [modalFlag, setModalFlag] = useState(false);
  const [changeNodeOptions, setChangeNodeOptions] = useState([]);
  const [changeNodeKey, setChangeNodeKey] = useState({});
  const hasSelectItem = selectItem && selectItem._cfg && selectItem._cfg.model.config.length > 0;

  useEffect(() => {
    if (selectItem) {
      const selectId = selectItem._cfg.model.id;
      const child = treeData.find((i) => selectId.split('-')[0] === i.key).children;
      setChangeNodeOptions(child.filter((i) => i.key !== selectId));
    }
  }, [selectItem]);

  const onSubmit = async () => {
    addFormModalRef.current.form.validateFields().then(async (values) => {
      const { nodes, edges } = flowChartData;
      if (nodes.length !== treeData.length) {
        message.warning(intl.formatMessage({ id: 'itemPanel.onSubmit.tips' }));
        return;
      }
      setBtnLoading(true);
      const _values = _.cloneDeep(values);
      if (_values.deviceType === 'PSDistJob') {
        _values.numPs = 1;
        _values.deviceNum = _values.deviceTotal;
      }
      _values.datasetPath = nodes[0].config[0].value;
      _values.outputPath = nodes[nodes.length - 1].config[0].value;
      _values.paramPath = _values.outputPath;
      const newNodes = nodes.map((i) => {
        return {
          ...i,
          id: i.id.split('-')[0],
        };
      });
      const newEdges = edges.map((i) => {
        const { source, target } = i;
        return {
          source: source,
          target: target,
        };
      });
      let submitData = {
        ...addFormData,
        ..._values,
        nodes: newNodes,
        edges: newEdges,
        isAdvance: false,
      };
      if (!detailId) delete submitData.id;
      const { code, data } = detailId
        ? await patchAvisualis(detailId, submitData)
        : await submitAvisualis(submitData);
      if (code === 0) {
        message.success(
          `${
            detailId
              ? intl.formatMessage({ id: 'itemPanel.save' })
              : intl.formatMessage({ id: 'itemPanel.create' })
          }intl.formatMessage({id: 'itemPanel.success'})！`,
        );
        dispatch({
          type: 'avisualis/saveData',
          payload: {
            addFormData: {},
          },
        });
        history.push('/ModelManagement/avisualis');
      }
      setBtnLoading(false);
    });
  };

  const getConfig = () => {
    const { config, id } = selectItem._cfg.model;
    return config.map((i) => {
      const { type, value, key, options } = i;
      if (type === 'string' || type === 'disabled') {
        return (
          <Form.Item
            key={id}
            name={`${id}-${key}`}
            label={key}
            initialValue={value}
            rules={[{ required: true, message: `${itemPanel.input}${key}` }]}
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
            key={id}
            name={`${id}-${key}`}
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
            key={id}
            name={`${id}-${key}`}
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
      const selectIdx = selectItem._cfg.model.idx;
      cloneData.nodes[selectIdx].config.forEach((m, n) => {
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
        <Button onClick={() => history.push(`/ModelManagement/avisualis`)}>
          {intl.formatMessage({ id: 'itemPanel.return' })}
        </Button>
        <Button type="primary" loading={btnLoading} onClick={onSubmit}>
          {detailId
            ? intl.formatMessage({ id: 'itemPanel.model.save' })
            : intl.formatMessage({ id: 'itemPanel.model.create' })}
        </Button>
      </div>
      <Descriptions title={intl.formatMessage({ id: 'itemPanel.model.deatil' })}></Descriptions>
      <AddFormModal ref={addFormModalRef} detailData={addFormData} />
      {hasSelectItem && (
        <>
          <div className="ant-descriptions-title">{`${
            hasSelectItem
              ? intl.formatMessage({ id: 'itemPanel.node.config' })
              : intl.formatMessage({ id: 'itemPanel.node.config.tips' })
          }`}</div>
          <Form form={form}>{getConfig()}</Form>
        </>
      )}
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
              <Option value={i.key}>{i.title}</Option>
            ))}
          </Select>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ avisualis }) => ({ avisualis }))(ItemPanel);
