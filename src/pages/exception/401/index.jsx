import { Link } from 'umi';
import { Result, Button } from 'antd';
import React from 'react';
import { stringify } from 'querystring';

import { USER_DASHBOARD_PATH } from '@/utils/const';


const queryString = stringify({
  redirect: encodeURIComponent(window.location.href),
});
export default () => {
  
  return (
    <Result
      status="403"
      style={{
        background: 'none',
      }}
      subTitle="尚未登录"
      extra={
        <Button href={USER_DASHBOARD_PATH + '?' + queryString} type="primary">
          去登录
        </Button>
      }
    />
)};
