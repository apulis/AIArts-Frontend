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
        <h3>版本号: {version}</h3>
        {i === 0 && <Tag color="#1890ff">当前版本</Tag>}
      </div>
    )
  };

  return (
    <PageHeaderWrapper title={false}>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/dataManage/dataSet')}
        title="数据集名称: MNIST"
      >
        <Collapse defaultActiveKey={['0']}>
          {data.map((item, index) => {
            const { creator, storage_path, create_time, update_time, description, version } = item;
            return (
              <Panel header={getPanelHeader(index, version)} key={index}>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="创建者">{creator}</Descriptions.Item>
                  <Descriptions.Item label="Storage Path">{storage_path}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{formatDate(create_time * 1000, 'YYYY-MM-DD HH:MM:SS')}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{formatDate(update_time * 1000, 'YYYY-MM-DD HH:MM:SS')}</Descriptions.Item>
                  <Descriptions.Item label="简介 ">{description}</Descriptions.Item>
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