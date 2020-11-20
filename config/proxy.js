/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
export default {
  dev: {
    '/ai_arts/api/': {
      target: 'http://10.31.3.106:5822/',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
    '/custom-user-dashboard-backend/': {
      target: 'http://localhost:5001',
      // target: 'http://121.46.18.83:50088/',
      // target: 'http://10.31.3.63/',
      changeOrigin: true,
      pathRewrite: {
        '^/custom-user-dashboard-backend': '',
      },
    },
    '/endpoints/api/datasources/proxy/1/api/v1': {
      target: 'http://10.31.3.208',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
    '/apis': {
      target: 'http://huawei-infra01.sigsus.cn',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
  },
  test: {
    '/api/': {
      target: 'http://sandbox2-master.sigsus.cn:56511/',
      // target: 'http://10.31.3.120:5000',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: {
        '^': '',
      },
    },
  },
};
