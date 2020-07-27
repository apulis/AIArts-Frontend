import { Card } from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React from 'react';
import Iframe from "react-iframe";

const WarningLog = () => {
  const url = 'http://219.133.167.42:52009/endpoints/grafana/alerting/list'
  return (
    <PageHeaderWrapper>
      <Card bodyStyle={{ padding: '0px 0px' }}>
        <Iframe url={url} width="100%" height="800"/>
      </Card>
    </PageHeaderWrapper>
  );
};

export default WarningLog;
