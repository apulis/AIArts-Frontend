import { formatMessage } from 'umi';

export const jobNameReg = {
  pattern: /^[A-Za-z0-9-_]+$/,
  message: formatMessage({ id: 'reg.input.limit.textType' }),
};

export const linuxPathReg = {
  pattern: /^\/$|(\/[a-zA-Z_0-9-]+)+$/,
  message: formatMessage({ id: 'reg.input.limit.linuxPath' }),
};

export const modelNameReg = {
  type: 'string',
  max: 255,
  message: formatMessage({ id: 'reg.input.limit.textLength' }),
};

export const getNameFromDockerImage = (tag) => {
  if (!tag) {
    return '';
  }
  return tag.replace(/(.+\/)/, '');
};

export const startUpFileReg = {
  pattern: /\.py|\.sh$/,
  message: formatMessage({ id: 'reg.input.limit.fileType' }),
};

export const getUserPathPrefixReg = (path) => {
  console.log({
    pattern:  new RegExp(`^${path}`),
    message: formatMessage({ id: 'reg.user.path.prefix.reg' }),
  })
  return {
    pattern:  new RegExp(`^${path}`),
    message: formatMessage({ id: 'reg.user.path.prefix.reg' }),
  }
}