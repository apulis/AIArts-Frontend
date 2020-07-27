import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import CodeList from './components/List'

const CodeDevelopment = () => {
  return (
    <PageHeaderWrapper>
      <CodeList></CodeList>
    </PageHeaderWrapper>
  )

}

export default CodeDevelopment;