import React, { useEffect, useState } from 'react';
import { Descriptions, Modal, Select } from 'antd';
import { useIntl } from 'umi';


import { getVCUser } from '@/services/vc';
import { ArrowUpOutlined, DeleteOutlined, DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';



interface IRemoveUserModal {
  visible: boolean;
  vcName: string;
  title: string;
  onOk: (userIds: number[], confirmed?: boolean) => void;
  onCancel: () => void;
  needConfirm?: boolean;
  activeJob?: {jobId: string, jobName: string}[];
}

const { Option } = Select;

const RemoveUserModal: React.FC<IRemoveUserModal> = ({ visible, vcName, title, onOk, onCancel, needConfirm, activeJob }) => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionDisabled, setActionDisabled] = useState<boolean>(false);

  const [readyRemoveUsers, setReadyRemoveUsers] = useState<{userName: string; userId: number}[]>([]);
  
  const { formatMessage } = useIntl();

  const fetchVCUsers = async () => {
    setLoading(true);
    const res = await getVCUser(vcName);
    setLoading(false);
    if (res.code === 0) {
      const { users } = res;
      setUsers(users.map(user => ({ userName: user.userName, userId: user.id })));
    }
  }

  useEffect(() => {
    
    if (visible) {
      fetchVCUsers();
    }
  }, [visible])

  const handleOk = async () => {
    setActionDisabled(true);
    await onOk(readyRemoveUsers.map(val => val.userId), needConfirm || undefined);
    setActionDisabled(false);
  }

  const handleCacel = () => {
    onCancel();
  }

  const handleRemoveUser = (user) => {
    if (actionDisabled) return;
    const newRemoveUsers = readyRemoveUsers.concat(user);
    setUsers(users.filter(val => val.userId !== user.userId));
    setReadyRemoveUsers(newRemoveUsers);
  }

  const handleCacelRemoveUser = (user) => {
    if (actionDisabled) return;
    const newRemoveUsers = readyRemoveUsers.filter(val => val.userId !== user.userId);
    setUsers(users.concat(user));
    setReadyRemoveUsers(newRemoveUsers);
  }

  return (
    <Modal
      visible={visible}
      title={title}
      onOk={handleOk}
      onCancel={handleCacel}
      width="65%"
    >
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <h3>
          {formatMessage({ id: 'vc.component.removeUser.modal.current.contains.user' })}
        </h3>
        {
          loading ? <LoadingOutlined /> : (
            users.map(user => (
              <div style={{ padding: '5px' }}>
                <div style={{ width: '120px', display: 'inline-block' }}>{user.userName}</div>
                <div onClick={() => handleRemoveUser(user)} style={{ display: 'inline-block', cursor: 'pointer' }}><DeleteTwoTone /></div>
              </div>
            ))
          )
        }
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>
        {formatMessage({ id: 'vc.component.removeUser.modal.current.removing.user' })}
        </h3>
        <div>
          {
            readyRemoveUsers.map(user => (
              <div style={{ padding: '5px' }}>
                <div style={{ width: '120px', display: 'inline-block' }}>{user.userName}</div>
                
                <div onClick={() => handleCacelRemoveUser(user)} style={{ display: 'inline-block', cursor: 'pointer' }}>
                  <ArrowUpOutlined title={formatMessage({ id: 'vc.component.removeUser.modal.current.removing.cancel' })} />
                </div>
              </div>
            ))
          }
        </div>
      </div>
      {
        needConfirm && <div style={{marginTop: '18px'}}>
          <h3>当前将移除的用户有仍在运行的 Job</h3>
          <div>再次点击确认按钮将会 kill 这些 Job：</div>
          {
            activeJob?.map(job => (
              <Descriptions>
                <Descriptions.Item label={'任务名称'}>{job.jobName}</Descriptions.Item>
                <Descriptions.Item label={'任务ID'}>{job.jobId}</Descriptions.Item>
              </Descriptions>
            ))
          }
        </div>
      }
    </Modal>
  )
}

export default RemoveUserModal;

