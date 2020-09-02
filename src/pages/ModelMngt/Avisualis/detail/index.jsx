import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree, PageHeader } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
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
import G6Edit from '../components/G6Edit';
import ItemPanel from '../components/ItemPanel';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = ({ global }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [avisualis, setAvisualis] = useState({ data: [], total: 0 });
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    setLoading(false);
  };

  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      icon: <SmileOutlined />,
      children: [
        {
          title: 'leaf',
          key: '0-0-0',
          icon: <MehOutlined />,
        },
        {
          title: 'leaf',
          key: '0-0-1',
          icon: ({ selected }) => (selected ? <FrownFilled /> : <FrownOutlined />),
        },
      ],
    }
  ];

  const onDragEnd = ({event, node}) => {
    const { dataTransfer, pageX } = event;
    if (dataTransfer.dropEffect !== 'none' && pageX > 384) {
      console.log('---e')
    }
  }

  return (
    <PageHeaderWrapper title={false}>
      <div className={styles.avisualisWrap}>
        <Card loading={loading}>
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
        <G6Edit />
        <Card>
          <ItemPanel />
        </Card>
      </div>
    </PageHeaderWrapper>
  );
};

export default connect(({ global }) => ({ global }))(AvisualisDetail);