import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
import { getPanel } from '../service';
import styles from './index.less';
import { useDispatch } from 'umi';
import {
  DownOutlined,
  FrownOutlined,
  SmileOutlined,
  MehOutlined,
  FrownFilled,
} from '@ant-design/icons'
import { connect } from 'dva';
import FlowChart from '../components/FlowChart';
import _ from 'lodash';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = (props) => {
  const { avisualis, location } = props;
  const { type, id } = location.query;
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [panelData, setPanelData] = useState([]);
  const [btnLoading, setBtnLoading] = useState(false);
  const flowChartRef = useRef();
  const [addFormData, setAddFormData] = useState(avisualis.addFormData);
  const [apiData, setApiData] = useState({});

  useEffect(() => {
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: {
        collapsed: false
      }
    });
    getData();
  }, []);

  const getData = async (text) => {
    // const { code, data } = await getPanel(type);
    const {code, data} = { code :0,data: [
      {
        "name": "Input",
        "children": [
          {
            "coco": [
              {
                "key": "class_num",
                "type": "disabled",
                "value": 80
              }
            ]
          },
          {
            "voc": [
              {
                "key": "class_num",
                "type": "disabled",
                "value": 20
              }
            ]
          }
        ]
      },
      {
        "name": "Backbone",
        "children": [
          {
            "ResNet": [
              {
                "key": "depth",
                "type": "select",
                "value": [
                  50,
                  101,
                  152
                ]
              }
            ]
          },
          {
            "ResNeXt": [
              {
                "key": "depth",
                "type": "select",
                "value": [
                  50,
                  101,
                  152
                ]
              }
            ]
          },
          {
            "SEResNet": [
              {
                "key": "depth",
                "type": "select",
                "value": [
                  50,
                  101
                ]
              }
            ]
          }
        ]
      },
      {
        "name": "neck",
        "children": [
          {
            "AdaptiveAvgMaxPool2d": [
              {}
            ]
          },
          {
            "AdaptiveCatAvgMaxPool2d": [
            ]
          },
          {
            "GlobalAveragePooling": [
            ]
          }
        ]
      },
    
      {
        "name": "Optimizer",
        "children": [
          {
            "SGD": [
              {
                "key": "learning_rate",
                "type": "number",
                "value": 0.001
              }
            ]
          },
          {
            "ADAM": [
              {
                "key": "learning_rate",
                "type": "number",
                "value": 0.001
              }
            ]
          }
        ]
      },
      {
        "name": "Output",
        "children": [
          {
            "output": [
              {
                "key": "work_dir",
                "type": "string",
                "value": "./work_dir"
              },
              {
                "key": "total_epochs",
                "type": "number",
                "value": 100
              }
            ]
          }
        ]
      }
    ]}
    if (code === 0 && data && data.length) {
      transformData(data);
      setApiData(data);
    }
  };

  const transformData = (data, newData) => {
    let _treeData = [], _children = [], _data = data || apiData, childrenDisabled = false;
    _data.forEach((i, idx) => {
      if (newData) {
        const len = newData && newData.nodes ? newData.nodes.length : 0;
        childrenDisabled = len > 0 && !(len < (idx + 1));
      }

      let _children = [];
      const { children, name } = i;
      if (children &&  children.length) {
        children.forEach((c, cdx) => {
          const key = Object.keys(c)[0];
          _children.push({
            title: key,
            key: `${idx}-${cdx}`,
            config: c[key],
            disabled: childrenDisabled
          })
        })
      }
      console.log('----111111111111111111', _children)
      _treeData.push({
        title: `步骤${idx + 1}：${name}`,
        key: `${idx}`,
        children: _children,
        disabled: true
      })
    })
    setPanelData(_treeData);
  }

  const onDragEnd = ({event, node}) => {
    const { dataTransfer, pageX } = event;
    console.log('------onDragEndonDragEnd', node)
    if (dataTransfer.dropEffect !== 'none' && pageX > 384) {
      const { handleDragEnd } = flowChartRef.current;
      handleDragEnd && handleDragEnd(node);
    }
  }

  return (
    <PageHeaderWrapper title={false}>
      <div className={styles.avisualisWrap}>
        <Card>
          {panelData.length ? <Tree
            showIcon
            defaultExpandAll
            draggable
            switcherIcon={<DownOutlined />}
            treeData={panelData}
            onDragEnd={onDragEnd}
            onDragStart={({event, node}) => event.dataTransfer.effectAllowed = 'move'}
          /> : null}
        </Card>
        <FlowChart ref={flowChartRef} transformData={transformData} isNewAdd={Boolean(id)} />
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ global, avisualis }) => ({ global, avisualis }))(AvisualisDetail);