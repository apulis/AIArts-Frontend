import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import { PageHeaderWrapper, PageLoading } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
// import { getDatasets, edit, deleteDataSet, add, download } from './service';
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

const AvisualisDetail = ({ global }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [avisualis, setAvisualis] = useState({ data: [], total: 0 });
  const [btnLoading, setBtnLoading] = useState(false);
  const flowChartRef = useRef();

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
    
  };

  const treeData = [
    {
      title: 'parent 1',
      key: '0',
      // icon: <SmileOutlined />,
      disabled: true,
      children: [
        {
          title: 'leaf',
          key: '0-0',
          // icon: <MehOutlined />,
        },
        {
          title: 'leaf',
          key: '0-1',
          disabled: true,
          // icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
        },
      ],
    }
  ];

  const onDragEnd = ({event, node}) => {
    const { dataTransfer, pageX } = event;
    console.log('------onDragEndonDragEnd', node)
    if (dataTransfer.dropEffect !== 'none' && pageX > 384) {
      const { handleDragEnd } = flowChartRef.current;
      handleDragEnd && handleDragEnd();
    }
  }
  
  return (
    <PageHeaderWrapper title={false}>
      <div className={styles.avisualisWrap}>
        <Card>
          <Tree
            showIcon
            defaultExpandAll
            draggable
            switcherIcon={<DownOutlined />}
            treeData={treeData}
            onDragEnd={onDragEnd}
            onDragStart={({event, node}) => event.dataTransfer.effectAllowed = 'move'}
          />
        </Card>
        <FlowChart ref={flowChartRef} />
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ global }) => ({ global }))(AvisualisDetail);