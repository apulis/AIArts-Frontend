import { Collapse, PageHeader, Descriptions, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
const { Panel } = Collapse;

const DataSetDetail = () => {
  const data = [{
    Creator: 'Lili Qu',
    StoragePath: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    CreateTime: '2017-01-10',
    UpdateTime: '2017-01-10',
    Description: 'DescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescription'
  },
  {
    Creator: 'Lili Qu',
    StoragePath: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    CreateTime: '2017-01-10',
    UpdateTime: '2017-01-10',
    Description: 'DescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescription'
  },
  {
    Creator: 'Lili Qu',
    StoragePath: 'xxxxxxxxxxxxxxxxxxxxxxxxxxx',
    CreateTime: '2017-01-10',
    UpdateTime: '2017-01-10',
    Description: 'DescriptionDescriptionDescriptionDescriptionDescriptionDescriptionDescription'
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
    <>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title="Dataset Name: testttttt"
      >
        <Collapse defaultActiveKey={['0']}>
          {data.map((item, index) => {
            const { Creator, StoragePath, CreateTime, UpdateTime, Description } = item;
            return (
              <Panel header={getPanelHeader(index)} key={index}>
                <Descriptions size="small" column={2}>
                  <Descriptions.Item label="Creator">{Creator}</Descriptions.Item>
                  <Descriptions.Item label="Storage Path">{StoragePath}</Descriptions.Item>
                  <Descriptions.Item label="Create Time">{CreateTime}</Descriptions.Item>
                  <Descriptions.Item label="Update Time">{UpdateTime}</Descriptions.Item>
                  <Descriptions.Item label="Description ">{Description}</Descriptions.Item>
                </Descriptions>
              </Panel>
            )
          })}
        </Collapse>
      </PageHeader>
    </>
  )
}

export default DataSetDetail;