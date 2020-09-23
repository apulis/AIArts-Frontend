import React, { useState, useEffect } from 'react';
import { Table, message, Modal, Input } from 'antd';
import { getImages, deleteImages } from '@/services/images';
import moment from 'moment';
import { connect } from 'dva';
import useInterval from '@/hooks/useInterval';

const { Search } = Input;

const ImageTable = (props) => {
  const [imageList, setImageList] = useState([]);
  const [pageParams, setPageParams] = useState({ pageNum: 1, pageSize: 10 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(10);

  const handleDeleteImage = async (id) => {
    Modal.confirm({
      title: '将会删除该镜像',
      content: '是否确认删除',
      async onOk() {
        const res = await deleteImages(id);
        if (res.code === 0) {
          message.success('成功删除');
          fetchImages({ pageParams, search });
        }
      },
      onCancel() {
        //
      },
    });
  };

  const columns = [
    {
      title: '镜像 ID',
      dataIndex: 'imageId',
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      render(_text, item) {
        return <div>{moment(item.createdAt).format('YYYY-MM-DD HH:mm')}</div>;
      },
    },
    {
      title: '操作',
      render(_text, item) {
        return (
          <div>
            <a style={{ color: 'red' }} onClick={() => handleDeleteImage(item.id)}>
              删除
            </a>
          </div>
        );
      },
    },
  ];

  const fetchImages = async ({ pageParams, search, withLoading = true }) => {
    if (withLoading) {
      setLoading(true);
    }
    const res = await getImages({ ...pageParams, search });
    setLoading(false);
    if (res.code === 0) {
      setImageList(res.data.savedImages);
      setTotal(res.data.total);
    }
  };

  useInterval(() => {
    fetchImages({ pageParams, search, withLoading: false });
  }, [props.common.interval]);

  useEffect(() => {
    fetchImages({ pageParams, search });
  }, [pageParams]);

  return (
    <div>
      <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
        <Search
          onSearch={(s) => fetchImages({ pageParams, search: s })}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '200px', float: 'right' }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={imageList}
        loading={loading}
        pagination={{
          total: total,
          showTotal: (total) => `总共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
          onChange: (pageNum, pageSize) => setPageParams({ pageNum, pageSize }),
          onShowSizeChange: (pageNum, pageSize) => setPageParams({ pageNum, pageSize }),
          current: pageParams.pageNum,
          pageSize: pageParams.pageSize,
        }}
      />
    </div>
  );
};

export default connect(({ common }) => ({ common }))(ImageTable);
