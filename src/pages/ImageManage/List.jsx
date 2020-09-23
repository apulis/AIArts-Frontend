import React, { useEffect, useState } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ImageTable from './components/ImageTable';

const List = () => {
  return (
    <PageHeaderWrapper>
      <ImageTable />
    </PageHeaderWrapper>
  );
};

export default List;
