// eslint-disable-next-line import/no-extraneous-dependencies
import { parse } from 'url';

// mock tableListDataSource
const genList = (current, pageSize) => {
  const tableListDataSource = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      id: index,
      name: `Code ${index}`,
      version: `Version ${index}`
    });
  }

  return tableListDataSource;
};

let tableListDataSource = genList(1, 100);

function getCodes(req, res, u) {
  let realUrl = u;

  if (!realUrl || Object.prototype.toString.call(realUrl) !== '[object String]') {
    realUrl = req.url;
  }

  const { current = 1, pageSize = 10 } = req.query;
  const params = parse(realUrl, true).query;
  let dataSource = [...tableListDataSource].slice((current - 1) * pageSize, current * pageSize);

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }

      return prev[s[0]] - next[s[0]];
    });
  }

  if (params.name) {
    dataSource = dataSource.filter((data) => data.name.includes(params.name || ''));
  }

  const result = {
    code: 0,
    data: {
      list: dataSource,
      pagination: {
        total: tableListDataSource.length,
        pageSize: parseInt(`${params.pageSize}`, 10) || 10,
        current: parseInt(`${params.current}`, 10) || 1,
      }
    },
    msg: 'success'
  };
  return res.json(result);
}

export default {
  'GET /api/project/experiment/code/list': getCodes
};