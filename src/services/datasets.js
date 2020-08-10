import request from '../utils/request'

export async function getLabeledDatasets(params) {
  return await request('/datasets?orderBy=created_at&order=desc&isTranslated=true', {params})
}