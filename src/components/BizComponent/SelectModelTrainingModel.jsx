import React, { useEffect, useState } from 'react';
import { Modal, Table, Input } from 'antd';
import moment from 'moment';
import { PAGEPARAMS, sortText } from '@/utils/const';
import { getModels } from '@/pages/ModelMngt/PretrainedModel/services';
import { useIntl, connect } from 'umi';

import { fetchTrainingList } from '@/services/modelTraning';
import { canCreateVisualJobStatus } from '@/utils/utils';

const { Search } = Input;

const SelectModelTrainingModel = ({ onCancel, visible, onOk, vc }) => {
  const { currentSelectedVC } = vc;

  const handleSelectModalPath = () => {
    // onOk && onOk(selectedRows[0]);
    onOk && onOk({name: 'xxxs'});
  };

  return (
    <Modal
      visible={visible}
      onCancel={() => onCancel && onCancel()}
      onOk={handleSelectModalPath}
      width="65%"
    >
      xxxs
    </Modal>
  );
};

export default connect(({ vc }) => ({ vc }))(SelectModelTrainingModel);
