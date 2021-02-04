import React from 'react';
import { Table, Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import { codeFont } from '../Submit';


const EnvTip: React.FC = (props) => {
  const { formatMessage } = useIntl();
  const { children } = props;
  const ENV_INTRO = {
    'DLWS_SD_ps0_IP': '',
    'DLWS_SD_ps0_SSH_PORT': '',
    'DLWS_SD_worker0_IP': '',
    'DLWS_SD_worker0_SSH_PORT': '',
    ' ': '',
    'DLWS_SD_worker15_IP': '',
    'DLWS_SD_worker15_SSH_PORT': '',
    'DLWS_ROLE_IDX': '',
  };
  
  
  const env = Object.keys(ENV_INTRO).map((key) => {
    return {
      key,
      desc: formatMessage({ id: `envTip.${key}` }),
      example: formatMessage({ id: `envTip.example.${key}` })
    }
  });
  return (
    <>
      <span>{children}</span>
      <Popover placement="topLeft" title={<pre style={{ fontFamily: codeFont }}>
        <h2 style={{ paddingTop: '20px' }}>{formatMessage({ id: 'envTip.title' })}</h2>
        <div>
          <Table
            pagination={false}
            columns={[
              {
                title: formatMessage({ id: 'envTip.table.desc' }),
                dataIndex: 'desc'
              },
              {
                title: formatMessage({ id: 'envTip.table.envKey' }),
                dataIndex: 'key',
              },
              {
                title: formatMessage({ id: 'envTip.table.envValue' }),
                dataIndex: 'example',
              }
            ]}
            dataSource={env}
          />
        </div>
      </pre>}>
        <QuestionCircleOutlined 
          style={{ cursor: 'pointer', marginLeft: '10px' }}
        />
      </Popover>
    </>
  )
}

export default EnvTip;
