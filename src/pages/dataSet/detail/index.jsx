import { Collapse, PageHeader, Descriptions, Tag } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { formatDate } from '@/utils/time';
const { Panel } = Collapse;

const DataSetDetail = () => {
  const data = [{
    creator: 'Lili Qu',
    storage_path: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    create_time: 1592364634,
    update_time: 1592364634,
    description: 'THE MNIST DATABASE of handwritten digits'
  },
  {
    creator: 'Lili Qu',
    storage_path: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    create_time: 1592364634,
    update_time: 1592364634,
    description: 'THE MNIST DATABASE of handwritten digits'
  },
  {
    creator: 'Lili Qu',
    storage_path: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    create_time: 1592364634,
    update_time: 1592364634,
    description: 'THE MNIST DATABASE of handwritten digits'
  }]
  
  const getPanelHeader = (i) => {
    return (
      <div className={styles.panelHeader}>
        <h3>Version: V00{data.length - i}</h3>
        {i === 0 && <Tag color="#1890ff">Current Version</Tag>}
      </div>
    )
  }

  return (
    <PageHeaderWrapper title={false}>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title="Dataset Name: MNIST"
      >
        <Collapse defaultActiveKey={['0']}>
          {data.map((item, index) => {
            const { creator, storage_path, create_time, update_time, description } = item;
            return (
              <Panel header={getPanelHeader(index)} key={index}>
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