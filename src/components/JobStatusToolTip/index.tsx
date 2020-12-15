import React from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';


interface IJobStatusToolTipProps {
  jobDetail: {
    jobStatusDetail: {};
    errorMsg?: string;
  };
}

const JobStatusToolTip: React.FC<IJobStatusToolTipProps> = ({ jobDetail }) => {
  
  const detail = jobDetail.jobStatusDetail;
  const title = (() => {
    if (!Array.isArray(detail)) return null;
    if (detail.length === 0) return null;
    const firstDetail = detail[0];
    if (typeof firstDetail !== 'object') return null;
    const firstDetailMessage = firstDetail.message;
    if (typeof firstDetailMessage === 'object') {
      return (
        <pre style={{ maxHeight: '400px', overflow: 'auto'}}>{JSON.stringify(firstDetailMessage, null, 2)}</pre>
      )
    }
    if (typeof firstDetail === 'object') {
      firstDetail.errorMsg = jobDetail.errorMsg;
      return <pre style={{ display: 'block', width: 'auto', fontSize: '12px' }}>{JSON.stringify(firstDetail, null, 2)}</pre>;
    }
    return null
  })();
  return (
    <Tooltip title={title} overlayStyle={{ maxWidth: 'auto' }} placement="rightTop">
      {
        title && <InfoCircleOutlined style={{ cursor: 'pointer', marginLeft: '6px', marginTop: '2px' }} twoToneColor="#eb2f96" />
      }
    </Tooltip>
  )
} 

export default JobStatusToolTip;