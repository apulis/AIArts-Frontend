import { Link } from 'umi'
import { message, Table, Modal, Form, Input, Button, Space } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { getProjects, deleteProject, addProject, updateProject } from './services';
import { PAGEPARAMS } from '../../../const';
import ModalForm from './components/ModalForm';
import { connect } from 'umi';
import { formatDate } from '@/utils/time';
// import { Resizable } from 'react-resizable';

// const ResizableTitle = props => {
//   const { onResize, width, ...restProps } = props;

//   if (!width) {
//     return <th {...restProps} />;
//   }

//   return (
//     <Resizable
//       width={width}
//       height={0}
//       handle={
//         <span
//           className="react-resizable-handle"
//           onClick={e => {
//             e.stopPropagation();
//           }}
//         />
//       }
//       onResize={onResize}
//       draggableOpts={{ enableUserSelectHack: false }}
//     >
//       <th {...restProps} />
//     </Resizable>
//   );
// };

const ModelList = props => {
  const {
    loading,
    dispatch,
    modelList: { data },
  } = props;
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(undefined);  
  const [pageParams, setPageParams] = useState(PAGEPARAMS);

  useEffect(() => {
    dispatch({
      type: 'modelList/fetch',
      payload: {
        current: pageParams.page,
        pageSize: pageParams.size
      },
    });
  }, [pageParams]);

  const pageParamsChange = (page, size) => {
    setPageParams({ page: page, size: size });
  };

  const columns = [
    {
      title: '模型名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 150,
      render: (text, record) => <Link to={ { pathname: '/aIarts/modelList/ExperimentList', query: { id: record.id } } }>{text}</Link>
    },
    {
      title: '状态',
      dataIndex: 'status',
      ellipsis: true,
      width: 100
    },
    {
      title: '引擎类型',
      dataIndex: 'engineType',
      ellipsis: true,
      width: 100,
    },
    {
      title: '存储路径',
      dataIndex: 'storePath',
      ellipsis: true,
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: text => formatDate(text, 'YYYY-MM-DD HH:MM:SS'),
      ellipsis: true,
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      ellipsis: true,
      width: 150
    },
    {
      title: '操作',
      width: 220,
      render: (item) => {
        return (
          <Space size="middle">
            <a onClick={() => showEditModal(item)}>模型下载</a>
            <a onClick={() => showEditModal(item)}>创建推理</a>
            <a onClick={() => showEditModal(item)}>删除</a>
          </Space>
        );
      },
    },
  ];

  const showEditModal = (item) => {
    setVisible(true);
    setCurrent(item);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleSubmit = values => {
    const id = current ? current.id : '';
    const params = {id, ...values }
    dispatch({
      type: 'modelList/update',
      payload: params
    });
  };

  return (
    <PageHeaderWrapper>
      <Table
        columns={columns}
        dataSource={data.list}
        rowKey={(r, i) => `${i}`}
        pagination={{
          total: data.pagination.total,
          showQuickJumper: true,
          showTotal: (total) => `总共 ${total} 条`,
          showSizeChanger: true,
          onChange: pageParamsChange,
          onShowSizeChange: pageParamsChange,
        }}
        loading={loading}
      />
      <ModalForm 
        current={current}
        visible={visible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
      />
    </PageHeaderWrapper>
  );
};

export default connect(({ modelList, loading }) => ({
  modelList,
  loading: loading.models.modelList,
}))(ModelList);