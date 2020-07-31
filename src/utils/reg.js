export const jobNameReg = {
  pattern: /^[A-Za-z0-9-_]+$/,
  message: '只能输入英文，数字和下划线'
}

export const modelNameReg = {
  type: 'string',
  max: 20,
  message: '不能超过20个字符串'
}