import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Tabs } from 'antd';
import { FormattedMessage } from 'umi';
import WarningLog from './components/WarningLog';
import VersionMngt from './components/VersionMngt';
const { TabPane } = Tabs;

const VisualOperation = (props) => {
  return (
    <PageHeaderWrapper>
      <Tabs defaultActiveKey="1">
        <TabPane tab={<FormattedMessage id="visualOperation.alarm.log" />} key="1">
          <WarningLog></WarningLog>
        </TabPane>
        <TabPane tab={<FormattedMessage id="visualOperation.version.manage" />} key="2">
          <VersionMngt></VersionMngt>
        </TabPane>
      </Tabs>
    </PageHeaderWrapper>
  );
};

export default VisualOperation;
