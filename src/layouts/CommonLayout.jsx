import React, { useEffect } from 'react';
import { connect } from 'dva';
import { PageLoading } from '@ant-design/pro-layout';
import { Result } from 'antd';
import { formatMessage } from 'umi';
import useInterval from '@/hooks/useInterval';

const CommonLayout = ({ children, dispatch, resource, user, common }) => {
  useEffect(() => {
    dispatch({
      type: 'resource/fetchResource',
    });
  }, []);
  const { currentUser } = user;
  const { currentVC, userName } = currentUser;


  useEffect(() => {
    dispatch({
      type: 'common/fetchPresetImages',
    });
  }, [])

  if (currentVC?.length === 0 && userName) {
    return (
      <Result
        status="warning"
        title={formatMessage({ id: 'vc.result.empty.vc' })}
        extra={formatMessage({ id: 'vc.need.add.to.vc' })}
      />
    );
  }
  
  if (Object.keys(resource.devices).length === 0) {
    return <PageLoading />;
  }
  return <>{children}</>;
};

export default connect(({ resource, user, common }) => ({ resource, user, common }))(CommonLayout);
