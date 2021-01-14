import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useIntl } from 'umi';
import { codeFont } from '../Submit';

export const ENV_INTRO = [
  'DLWS_SD_ps0_IP',
  'DLWS_SD_ps0_SSH_PORT',
  'DLWS_SD_worker0_IP',
  'DLWS_SD_worker0_SSH_PORT',
  'other',
  'DLWS_SD_worker15_IP',
  'DLWS_SD_worker15_SSH_PORT',
  'DLWS_ROLE_IDX'
];


const EnvTip: React.FC = (props) => {
  const { children } = props;
  const { formatMessage } = useIntl();
  const env = ENV_INTRO.map((key) => {
    return {
      key,
      desc: formatMessage({ id: `envTip.${key}` }),
    }
  });
  return (
    <>
      <span>{children}</span>
      <Tooltip placement="topLeft" title={<pre style={{ fontFamily: codeFont }}>
        <h2 style={{ color: '#fff' }}>{formatMessage({ id: 'envTip.title' })}</h2>
        {
          env.map(e => {
            return (
              <div>
                <span>{e.key}: </span>
                <span>{e.desc}</span>
              </div>
            )
          })
        }
      </pre>}>
        <QuestionCircleOutlined 
          style={{ cursor: 'pointer', marginLeft: '10px' }}
        />
      </Tooltip>
    </>
  )
}

export default EnvTip;