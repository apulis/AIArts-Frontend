import request from '../utils/request'

export async function getLabeledDatasets() {
  return await request('/annotations/datasets')
}