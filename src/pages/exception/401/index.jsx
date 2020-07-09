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
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Result
        status="403"
        style={{
          background: 'none',
          marginTop: '-200px'
        }}
        subTitle="尚未登录"
        extra={
          <Button href={USER_DASHBOARD_PATH + '?' + queryString} type="primary">
            去登录
          </Button>
        }
      />
    </div>
    
)};