import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Divider, Select, Col, Row, message, PageHeader, Modal } from 'antd';

const CreateTrainJob = () => {
  <>
    <PageHeader
      className="site-page-header"
      onBack={() => history.push('/model-training/modelTraining')}
      title='训练参数管理'
    />
  </>
}