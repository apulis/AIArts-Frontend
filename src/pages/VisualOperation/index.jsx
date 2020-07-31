import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import WarningLog from './components/WarningLog'
import VersionMngt from './components/VersionMngt'
const { TabPane } = Tabs;

const VisualOperation = (props) => {
  return (
    <PageHeaderWrapper>
      <Tabs defaultActiveKey="1">
        <TabPane tab="告警日志" key="1">
          <WarningLog></WarningLog>
        </TabPane>
        <TabPane tab="版本管理" key="2">
          <VersionMngt></VersionMngt>
        </TabPane>
      </Tabs>
    </PageHeaderWrapper>
  )
}

export default VisualOperation