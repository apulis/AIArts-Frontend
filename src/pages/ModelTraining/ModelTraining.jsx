import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Tabs, Card } from 'antd';
import List from './List'
import ParamsManage from './ParamsManage/ParamsManage'

const { TabPane } = Tabs;

const ModelTraining = () => {
  const handleTabChange = (key) => {

  };
  return (
    <PageHeaderWrapper>
      <Card bordered={false}
        bodyStyle={{
          padding: '8'
        }}
      >
        <Tabs defaultActiveKey="1" onChange={handleTabChange}>
          <TabPane tab="模型训练" key="1">
            <List />
          </TabPane>
          <TabPane tab="训练参数管理" key="2">
            <ParamsManage></ParamsManage>
        </TabPane>
        </Tabs>
      </Card>
    </PageHeaderWrapper>
  )
}

export default ModelTraining