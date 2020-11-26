import request from '@/utils/request';

interface IfetchAllJobsParams {
  pageNum: number,
  pageSize: number;
  searchWord: string;
  orderBy: string;
  order: string;
  status: string;
  vcName: string;
  jobType: string;
}

export const fetchAllJobs = (params: IfetchAllJobsParams) => {
  return request('/jobs', {
    params: {
      ...params,
    },
  })
}

export const fetchAllJobsSummary = () => {
  return request('/jobs/summary');
}