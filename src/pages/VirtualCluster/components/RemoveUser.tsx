import React, { useEffect, useState } from 'react';
import { Modal, Select } from 'antd';
import { useIntl } from 'umi';


import { getVCUser } from '@/services/vc';
import { ArrowUpOutlined, DeleteOutlined, DeleteTwoTone, LoadingOutlined } from '@ant-design/icons';



interface IRemoveUserModal {
  visible: boolean;
  vcName: string;
  title: string;
  onOk: (userIds: number[]) => void;
  onCancel: () => void;
}

const { Option } = Select;

const RemoveUserModal: React.FC<IRemoveUserModal> = ({ visible, vcName, title, onOk, onCancel }) => {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [readyRemoveUsers, setReadyRemoveUsers] = useState<{userName: string; userId: number}[]>([]);
  
  const { formatMesssage } = useIntl();

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

  const handleOk = () => {
    onOk(readyRemoveUsers.map(val => val.userId));
  }

  const handleCacel = () => {
    onCancel();
  }

  const handleRemoveUser = (user) => {
    const newRemoveUsers = readyRemoveUsers.concat(user);
    setUsers(users.filter(val => val.userId !== user.userId));
    setReadyRemoveUsers(newRemoveUsers);
  }

  const handleCacelRemoveUser = (user) => {
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
    >
      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
        <h3>
          {formatMesssage({ id: 'vc.component.removeUser.modal.current.contains.user' })}
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
        {formatMesssage({ id: 'vc.component.removeUser.modal.current.removing.user' })}
        </h3>
        <div>
          {
            readyRemoveUsers.map(user => (
              <div style={{ padding: '5px' }}>
                <div style={{ width: '120px', display: 'inline-block' }}>{user.userName}</div>
                
                <div onClick={() => handleCacelRemoveUser(user)} style={{ display: 'inline-block', cursor: 'pointer' }}>
                  <ArrowUpOutlined title={formatMesssage({ id: 'vc.component.removeUser.modal.current.removing.cancel' })} />
                </div>
              </div>
            ))
          }
        </div>
      </div>
      
    </Modal>
  )
}

export default RemoveUserModal;

