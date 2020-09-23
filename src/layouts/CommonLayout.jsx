import React, { useEffect } from 'react';
import { connect } from 'dva';
import { PageLoading } from '@ant-design/pro-layout';

const CommonLayout = ({ children, dispatch, resource }) => {
  useEffect(() => {
    dispatch({
      type: 'resource/fetchResource',
    });
  }, []);
  if (Object.keys(resource.devices).length === 0) {
    return <PageLoading />;
  }
  return <>{children}</>;
};

export default connect(({ resource }) => ({ resource }))(CommonLayout);
