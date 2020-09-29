import React from 'react';
import { Card } from 'antd';
import Iframe from 'react-iframe';

const WarningLog = () => {
  let grafana;
  if (process.env.NODE_ENV === 'development') {
    grafana = 'http://219.133.167.42:52009/endpoints/grafana_zh/';
  } else {
    const protocol = window.location.protocol;
    const host = window.location.host;
    grafana = protocol + '//' + host + '/endpoints/grafana_zh/';
  }
  const url = `${grafana}alerting/list?kiosk=tv`;
  return (
    <Card bodyStyle={{ padding: '0px 0px' }}>
      <Iframe url={url} width="100%" height="800" />
    </Card>
  );
};

export default WarningLog;
