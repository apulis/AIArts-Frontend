import React from 'react';
import { Card } from 'antd';
import Iframe from 'react-iframe';
import { getLocale, setLocale } from 'umi';

const WarningLog = () => {
  let grafana;
  const language = getLocale();
  if (process.env.NODE_ENV === 'development') {
    grafana = 'http://219.133.167.42:6688/endpoints/grafana/';
  } else {
    const protocol = window.location.protocol;
    const host = window.location.host;
    // const language = getLocale();
    const domainName = protocol + '//' + host;
    const grafanaLinks = {
      'zh-CN': domainName + '/endpoints/grafana_zh/',
      'en-US': domainName + '/endpoints/grafana/',
    };
    grafana = grafanaLinks[language];
  }
  const url = `${grafana}alerting/list?kiosk=tv`;
  return (
    <Card bodyStyle={{ padding: '0px 0px' }}>
      <Iframe url={url} width="100%" height="800" />
    </Card>
  );
};

export default WarningLog;
