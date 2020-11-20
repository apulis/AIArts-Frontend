import React, { useEffect, useState } from 'react'
import { Modal, Form, Select, Table, Spin } from 'antd';
import { useIntl } from 'umi';

import { fetchUsers } from '@/services/vc';

const { Option } = Select;
const { useForm } = Form;
const FormItem = Form.Item;

interface ISelectUserModal {
  visible: boolean;
  onOk?: (userIds: number[]) => void;
  onCancel?: () => void;
}

const SelectUserModal: React.FC<ISelectUserModal> = ({ visible, onOk, onCancel }) => {
  const [form] = useForm();
  const { validateFields } = form;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState<string>('');
  const [fetching, setFetching] = useState<boolean>(false);
  const { formatMessage } = useIntl();
  const handleOk = async () => {
    const result = await validateFields();
    console.log('result', result)
    onOk && onOk(result.userIds);
  }

  const handleCancel = () => {
    onCancel && onCancel();
  }

  const searchUsers = async (search) => {
    if (!search) return;
    setFetching(true);
    setSearch(search)
    const res = await fetchUsers(1, 9999, search);
    setFetching(false);
    if (res.code === 0) {
      const users = res.list.map(user => {
        return {
          userName: user.userName,
          userId: user.id,
        }
      })
      setUsers(users);
    }
  }

  useEffect(() => {
    if (visible && search) {
      searchUsers(search)
    }
  }, [visible])

  return (
    <>
      {
        visible && <Modal
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          title={formatMessage({ id: 'vc.component.relateUser.modal.title' })}
        >
          <Form
            form={form}
          >
            <FormItem label={formatMessage({ id: 'vc.component.relateUser.modal.userName' })} name="userIds">
              <Select
                style={{ width: '240px' }}
                mode="multiple"
                notFoundContent={fetching ? <Spin size="small" /> : null}
                filterOption={false}
                onSearch={searchUsers}
                placeholder={formatMessage({ id: 'vc.component.relateUser.username.placeholder' })}
              >
                {
                  users.map(user => (
                    <Option key={user.userId} value={user.userId}>{user.userName}</Option>
                  ))
                }
              </Select>
            </FormItem>
          </Form>
        </Modal>
      }
    </>
  )
}

export default SelectUserModal;