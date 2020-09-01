import { message, Table, Modal, Form, Input, Button, Card, TextArea, Radio, Select, Tree } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect, useRef, useForm } from 'react';
// import { getDatasets, edit, deleteDataSet, add, download } from './service';
import { PAGEPARAMS, sortText, NameReg, NameErrorText } from '@/utils/const';
import styles from './index.less';
import { Link, history, useDispatch } from 'umi';
import {
  DownOutlined,
  FrownOutlined,
  SmileOutlined,
  MehOutlined,
  FrownFilled,
} from '@ant-design/icons'
import moment from 'moment';
import { connect } from 'dva';

const { confirm } = Modal;
const { Search } = Input;

const AvisualisDetail = ({ global }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [avisualis, setAvisualis] = useState({ data: [], total: 0 });
  const [pageParams, setPageParams] = useState(PAGEPARAMS);
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
  }, [pageParams]);

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

  const overD = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  return (
    <div>
      <Card>
        <Tree
          showIcon
          defaultExpandAll
          draggable
          switcherIcon={<DownOutlined />}
          treeData={treeData}
          onDragEnd={({event, node}) => console.log('-----end', node)}
          onDragStart={({event, node}) => {event.dataTransfer.effectAllowed = 'move'}}
        />
       </Card>
      <div className={styles.aaa} draggable="true" onDrop={e => overD(e)} onDragOver={e => overD(e)}></div>
    </div>
  );
};

export default connect(({ global }) => ({ global }))(AvisualisDetail);