import request from '../utils/request'

export async function getLabeledDatasets() {
  return await request('/datasets?orderBy=created_at&order=desc&isTranslated=true')
}