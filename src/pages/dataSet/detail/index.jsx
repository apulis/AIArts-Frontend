import { Collapse, PageHeader, Descriptions, Tag } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history } from 'umi';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { formatDate } from '@/utils/time';
import { getDatasetDetail } from '../service';
const { Panel } = Collapse;

const DataSetDetail = () => {
  const [data, setData] = useState([]);
  const id = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    getData();
  }, [id])

  const getData = async () => {
    const { code, data, msg, total } = await getDatasetDetail(id);
    if (code === 0) {
      setData(data);
    } else {
      message.error(msg);
    }
  };
  
  const getPanelHeader = (i, version) => {
    return (
      <div className={styles.panelHeader}>
        <h3>Version: {version}</h3>
        {i === 0 && <Tag color="#1890ff">Current Version</Tag>}
      </div>
    )
  };

  return (
    <PageHeaderWrapper title={false}>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/data-manage/dataSetManage')}
        title="Dataset Name: MNIST"
      >
        <Collapse defaultActiveKey={['0']}>
          {data.map((item, index) => {
            const { creator, storage_path, create_time, update_time, description, version } = item;
            return (
              <Panel header={getPanelHeader(index, version)} key={index}>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="creator">{creator}</Descriptions.Item>
                  <Descriptions.Item label="Storage Path">{storage_path}</Descriptions.Item>
                  <Descriptions.Item label="Create Time">{formatDate(create_time, 'YYYY-MM-DD HH:MM:SS')}</Descriptions.Item>
                  <Descriptions.Item label="Update Time">{formatDate(update_time, 'YYYY-MM-DD HH:MM:SS')}</Descriptions.Item>
                  <Descriptions.Item label="description ">{description}</Descriptions.Item>
                </Descriptions>
              </Panel>
            )
          })}
        </Collapse>
      </PageHeader>
    </PageHeaderWrapper>
  )
}

export default DataSetDetail;