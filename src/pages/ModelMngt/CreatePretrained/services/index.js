import request from '@/utils/request';
import { modelEvaluationType } from '@/utils/const';

export async function getTrainingJobs(params) {
  return request(`/trainings`, {
    params
  });
}

export async function fetchPresetTemplates() {
  return await request(`/templates`, {
    params: {
      pageNum: 1,
      pageSize: 10000,
      jobType: modelEvaluationType,
      scope: 3,
    }
  })
}