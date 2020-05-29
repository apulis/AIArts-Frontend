import { Collapse, PageHeader, Descriptions, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
const { Panel } = Collapse;

const DataSetDetail = () => {
  const getPanelHeader = () => {
    return (
      <div className={styles.panelHeader}>
        <h3>Version: V009</h3>
        <Tag color="#1890ff">Current Version</Tag>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title="Dataset Name: "
      >
        <Collapse defaultActiveKey={['1']}>
          <Panel header={getPanelHeader()} key="1">
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="Creator">Lili Qu</Descriptions.Item>
              <Descriptions.Item label="Storage Path">xxxxxxxxxxxxxxxxxxxxxxxxxxx</Descriptions.Item>
              <Descriptions.Item label="Create Time">2017-01-10</Descriptions.Item>
              <Descriptions.Item label="Update Time">2017-10-10</Descriptions.Item>
              <Descriptions.Item label="Description ">Description Description Description Description DescriptionDescription Description Description Description Description </Descriptions.Item>
            </Descriptions>
          </Panel>
          <Panel header="This is panel header 2" key="2">
            <p>{1111}</p>
          </Panel>
          <Panel header="This is panel header 3" key="3" disabled>
            <p>{1111}</p>
          </Panel>
        </Collapse>
      </PageHeader>
    </>
  )
}

export default DataSetDetail;