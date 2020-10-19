import React, { useState, useEffect, forwardRef } from 'react';
import {
  Typography,
  Button,
  Row,
  Col,
  Divider,
  Timeline,
  List,
  Skeleton,
  Space,
  Modal,
  Progress,
  Card,
  message,
  Descriptions,
  Tabs,
} from 'antd';
import { FormattedMessage, formatMessage } from 'umi';
import { getInitData, getUpgradeInfo, getUpgradeLog, upgrade } from '../../service.js';
import { isEmptyString } from '../../../../utils/utils.js';
import styles from './index.less';
const { TabPane } = Tabs;
const { Paragraph } = Typography;
let logTimer = null;
const VersionMngt = (props) => {
  // let logTimer = null // 放这访问不到
  const { Title, Paragraph, Text } = Typography;
  const [initData, setInitData] = useState({});
  const [vHistoryNum, setVHistoryNum] = useState(10);
  const [versionInfo, setVersionInfo] = useState({});
  const [versionLogs, setVersionLogs] = useState([]);
  const [upgradeText, setUpgradeText] = useState('一键升级');
  const [upgrading, setUpgrading] = useState(false);
  const [logs, setLogs] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const [checkingFlag, setCheckingFlag] = useState(false);

  const renderInit = async () => {
    const result = await apiGetInitData();
    if (result) {
      setInitData(result);
      setVersionInfo(result.versionInfo);
      setVersionLogs(result.versionLogs.slice(0, vHistoryNum));
      if (result.isUpgrading) {
        upgradeManager('continue');
      } else {
        // upgradeManager('init')
        setUpgradeText(formatMessage({ id: 'visualOperation.version.button.upgrade' }));
        setUpgrading(false);
        setLogs('');
      }
    }
  };

  useEffect(() => {
    renderInit();
    return () => {
      clearInterval(logTimer);
    };
  }, []);

  const upgradIngStatusHandler = async (logData) => {
    switch (logData.status) {
      case 'not ready':
        upgradeManager('finish');
        break;
      case 'upgrading':
        if (!isEmptyString(logData.logs)) setLogs(logData.logs);
        break;
      case 'success':
        upgradeManager('finish');
        break;
      case 'error':
        upgradeManager('error');
        break;
    }
  };

  const upgradeManager = async (step) => {
    switch (step) {
      case 'init':
        renderInit();
        break;
      case 'check':
        setCheckingFlag(true);
        const upgradeInfo = await apiGetUpgradeInfo();
        if (upgradeInfo.canUpgrade) {
          if (upgradeInfo.isLowerVersion) {
            Modal.confirm({
              title: formatMessage({ id: 'visualOperation.version.modal.upgrade.title' }),
              okText: formatMessage({ id: 'visualOperation.version.modal.upgrade.confirm' }),
              cancelText: formatMessage({ id: 'visualOperation.version.modal.upgrade.cancel' }),
              content: (
                formatMessage({ id: 'visualOperation.version.modal.upgrade.check.content' })
              ),
              onOk() {
                upgradeManager('begin');
              },
            });
          } else {
            upgradeManager('begin');
          }
        } else {
          Modal.error({
            title:  formatMessage({ id: 'visualOperation.version.modal.error.title' }),
            content: formatMessage({ id: 'visualOperation.version.modal.error.content' }),
          });
        }
        setCheckingFlag(false);
        break;
      case 'begin':
        const result = await apiUpgrade();
        if (result) {
          setUpgradeText(formatMessage({ id: 'visualOperation.version.button.begin.upgrade' }));
          logTimer = setInterval(upgradeManager.bind(this, 'upgrading'), 1000);
        }
        break;
      case 'continue':
        if (logTimer) clearInterval(logTimer);
        logTimer = setInterval(upgradeManager.bind(this, 'upgrading'), 1000);
        break;
      case 'upgrading':
        if (!upgrading) setUpgrading(true);
        setUpgradeText(formatMessage({ id: 'visualOperation.version.button.upgrading' }));
        const logData = await apiGetUpgradeLog();
        if (logData) {
          upgradIngStatusHandler(logData);
        }
        break;
      case 'finish':
        setUpgradeText(formatMessage({ id: 'visualOperation.version.button.upgrade.success' }));
        if (logTimer) clearInterval(logTimer);
        setTimeout(() => {
          message.success(
            <FormattedMessage id="visualOperation.version.message.upgrade.success" />,
          );
          upgradeManager('init');
        }, 1000);

        break;
      case 'error':
        setUpgradeText(formatMessage({ id: 'visualOperation.version.button.upgrade.error' }));
        if (logTimer) clearInterval(logTimer);
        message.error(<FormattedMessage id="visualOperation.version.message.upgrade.error" />);
        break;
    }
  };

  const apiGetInitData = async () => {
    const { code, data, msg } = await getInitData();
    let return_data = null;
    if (code === 0) {
      return data;
    }
    message.error(<FormattedMessage id="visualOperation.version.service.error" />);
  };

  const apiGetUpgradeInfo = async () => {
    const { code, data, msg } = await getUpgradeInfo();
    let return_data = null;
    if (code === 0) {
      return_data = data;
    } else {
      message.error(<FormattedMessage id="visualOperation.version.service.error" />);
    }
    return return_data;
  };

  const apiUpgrade = async () => {
    const { code, data, msg } = await upgrade();
    switch (code) {
      case 0:
        return true;
      case 30501:
        Modal.error({
          title: formatMessage({ id: 'visualOperation.version.modal.upgrade.title' }),
          content: formatMessage({ id: 'visualOperation.version.modal.upgrade.30501.content' }),
        });
        break;
      case 30502:
        Modal.error({
          title: formatMessage({ id: 'visualOperation.version.modal.upgrade.title' }),
          content: formatMessage({ id: 'visualOperation.version.modal.upgrade.30502.content' }),
        });
        break;
      case 30503:
        Modal.error({
          title: formatMessage({ id: 'visualOperation.version.modal.upgrade.title' }),
          content: formatMessage({ id: 'visualOperation.version.modal.upgrade.30503.content' }),
        });
        break;
    }
    return false;
  };

  const apiGetUpgradeLog = async () => {
    const { code, data, msg } = await getUpgradeLog();
    let return_data = null;
    if (code === 0) {
      return_data = data;
    } else {
      upgradeManager('error');
    }
    return return_data;
  };
  const handleShowHistoryModal = () => {
    setHistoryVisible(true);
  };
  const handleLoadMoreHistory = async () => {
    const len = initData.versionLogs.length;
    if (len > vHistoryNum) {
      const newNum = len <= vHistoryNum + 10 ? len : vHistoryNum + 10;
      setVersionLogs(initData.versionLogs.slice(0, newNum));
      setVHistoryNum(newNum);
    } else {
      Modal.info({
        title: formatMessage({ id: 'visualOperation.version.modal.tip' }),
        content: (
          <div>
            <p>
            {formatMessage({ id: 'visualOperation.version.modal.content.no.more.history' })}
            </p>
          </div>
        ),
      });
    }
  };

  return (
    <Card>
      <Button
        type="primary"
        onClick={() => {
          handleShowHistoryModal();
        }}
        style={{ position: 'absolute', right: '0px', marginRight: '24px' }}
      >
        <FormattedMessage id="visualOperation.upgrade.history" />
      </Button>
      <Descriptions title={<FormattedMessage id="visualOperation.version.info" />} bordered>
        <Descriptions.Item label={<FormattedMessage id="visualOperation.version.code" />}>
          {versionInfo.name}
        </Descriptions.Item>
        <Descriptions.Item
          label={<FormattedMessage id="visualOperation.upgraded.person" />}
          span={1}
        >
          {versionInfo.creator}
        </Descriptions.Item>
        <Descriptions.Item label={<FormattedMessage id="visualOperation.install.time" />} span={1}>
          {versionInfo.time}
        </Descriptions.Item>
        <Descriptions.Item
          label={<FormattedMessage id="visualOperation.version.describe" />}
          span={3}
        >
          {versionInfo.desc}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        title={<FormattedMessage id="visualOperation.local.upgrade" />}
        style={{ marginTop: '30px' }}
      ></Descriptions>
      <div>
        <Button
          type="primary"
          onClick={() => {
            if (!checkingFlag) upgradeManager('check');
          }}
          disabled={upgradeText !== formatMessage({ id: 'visualOperation.version.button.upgrade' })}
        >
          {upgradeText}
        </Button>
        {upgrading && (
          <div style={{ height: '120px', marginTop: '14px' }}>
            <Paragraph ellipsis={{ rows: 5 }}>{logs}</Paragraph>
          </div>
        )}
      </div>
      {historyVisible && (
        <Modal
          title={<FormattedMessage id="visualOperation.upgrade.history" />}
          visible={historyVisible}
          onCancel={() => {
            setHistoryVisible(false);
          }}
          maskClosable={false}
          footer={[
            <Button
              onClick={() => {
                setHistoryVisible(false);
              }}
            >
              <FormattedMessage id="visualOperation.button.close" />
            </Button>,
          ]}
        >
          <div
            style={{
              height: '320px',
              overflowY: 'scroll',
              paddingTop: '10px',
              position: 'relative',
            }}
          >
            <Timeline>
              {versionLogs.map((item, key) => (
                <Timeline.Item key={key}>{item}</Timeline.Item>
              ))}
            </Timeline>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                position: 'absolute',
                width: '100%',
                bottom: '10px',
              }}
            >
              <Button type="primary" onClick={handleLoadMoreHistory}>
                <FormattedMessage id="visualOperation.more.history" />
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
};

export default VersionMngt;
