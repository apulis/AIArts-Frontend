export const jobNameReg = {
  pattern: /^[A-Za-z0-9-_]+$/,
  message: '只能输入英文，数字和下划线'
};

export const linuxPathReg = {
  pattern: /^\/$|(\/[a-zA-Z_0-9-]+)+$/,
  message: '路径必须以\'/\'开头, 只能包含字母,数字和下划线'
};

export const modelNameReg = {
  type: 'string',
  max: 255,
  message: '不能超过255个字符串'
};

export const getNameFromDockerImage = (tag) => {
  if (!tag) {
    return '';
  }
  return tag.replace(/(.+\/)/, '');
};

export const startUpFileReg = { pattern: /\.py|\.sh$/, message: '需要填写 python 或 shell 文件' }