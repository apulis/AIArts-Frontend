export default {
  define: {
    // 添加这个自定义的环境变量
    'process.env.UMI_ENV': process.env.UMI_ENV, // * 本地开发环境：local，uat环境：uat，生产环境prod
    'process.env.MOCK_URL': 'http://localhost:8000',
    // 'process.env.MOCK_URL': 'http://10.31.3.110:8000',
  },
  proxy: {
  }
}
