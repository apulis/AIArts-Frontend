import React, { useEffect } from 'react';
import { connect } from 'dva';





const CommonLayout = ({children, dispatch}) => {
  useEffect(() => {
    // dispatch({
    //   type: 'resource/fetchResource'
    // })
  }, [])
  return <>{children}</>
}

export default connect()(CommonLayout);