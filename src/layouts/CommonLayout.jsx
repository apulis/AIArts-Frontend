import React, { useEffect } from 'react';
import { connect } from 'dva';
import { PageLoading } from '@ant-design/pro-layout';
import { Result } from 'antd';
import { formatMessage } from 'umi';

const CommonLayout = ({ children, dispatch, resource, user }) => {
  useEffect(() => {
    dispatch({
      type: 'resource/fetchResource',
    });
    dispatch({
      type: 'common/fetchPlatformConfig',
    });
  }, []);
  const { currentUser } = user;
  const { currentVC, userName } = currentUser;
  if (currentVC.length === 0 && userName) {
    return (
      <Result
        status="warning"
        title={formatMessage({ id: 'vc.result.empty.vc' })}
        extra={formatMessage({ id: 'vc.need.add.to.vc' })}
      />
    );
  }
  if (currentVC.length > 0) {
    if (!localStorage.vc || !currentVC.includes(localStorage.vc)) {
      dispatch({
        type: 'vc/userSelectVC',
        payload: {
          vcName: currentVC[0],
        },
      });
    }
  }
  if (Object.keys(resource.devices).length === 0) {
    return <PageLoading />;
  }
  return <>{children}</>;
};

export default connect(({ resource, user }) => ({ resource, user }))(CommonLayout);
