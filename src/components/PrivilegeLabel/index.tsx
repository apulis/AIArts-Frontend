import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React from 'react';
import { useIntl } from 'umi';

interface IPrivilegedLabelProps {
  disablePrivileged: boolean;
  noPrivilegedJobPermission: boolean;
}

const PrivilegedLabel: React.FC<IPrivilegedLabelProps> = ({ disablePrivileged, noPrivilegedJobPermission }) => {
  const { formatMessage } = useIntl();
  if (disablePrivileged) {
    return (<Tooltip title={formatMessage({ id: 'ManagePrivilegeJob.isPrivileged.label.disable.tip' })}>
        {formatMessage({ id: 'ManagePrivilegeJob.isPrivileged.label' })}
        <QuestionCircleOutlined style={{ marginLeft: '6px'}} />
      </Tooltip>)
  }
  if (noPrivilegedJobPermission) {
    return (<Tooltip title={formatMessage({ id: 'ManagePrivilegeJob.isPrivileged.label.no.permission.tip' })}>
      {formatMessage({ id: 'ManagePrivilegeJob.isPrivileged.label' })}
      <QuestionCircleOutlined style={{ marginLeft: '6px'}} />
    </Tooltip>)
  }
  return <div>{formatMessage({ id: 'ManagePrivilegeJob.isPrivileged.label' })}</div>
}

export default PrivilegedLabel