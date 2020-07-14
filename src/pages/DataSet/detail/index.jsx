import { Collapse, PageHeader, Descriptions, Tag } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history } from 'umi';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { getDatasetDetail } from '../service';
import { PageLoading } from '@ant-design/pro-layout';
import moment from 'moment';

const { Panel } = Collapse;

const DataSetDetail = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    getData();
  }, [id])

  const getData = async () => {
    const { code, data, msg, total } = await getDatasetDetail(id);
    if (code === 0 && data) {
      setData([data.dataset]);
    } else {
      msg && message.error(msg);
    }
    setLoading(false);
  };
  
  const getPanelHeader = (i, version) => {
    return (
      <div className={styles.panelHeader}>
        <h3>版本号: {version}</h3>
        {i === 0 && <Tag color="#1890ff">当前版本</Tag>}
      </div>
    )
  };

  if (loading) return (<PageLoading />)

  return (
    <PageHeaderWrapper title={false}>
      <PageHeader
        ghost={false}
        onBack={() => history.push('/dataManage/dataSet')}
        title={`数据集名称: ${data[0].name}`}
      >
        <Collapse defaultActiveKey={['0']}>
          {data.map((item, index) => {
            const { creator, path, createdAt, updatedAt, description, version } = item;
            return (
              <Panel header={getPanelHeader(index, version)} key={index}>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="创建者">{creator}</Descriptions.Item>
                  <Descriptions.Item label="Storage Path">{path}</Descriptions.Item>
                  <Descriptions.Item label="创建时间">{moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                  <Descriptions.Item label="更新时间">{moment(updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
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