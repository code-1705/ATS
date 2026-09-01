import axios from 'axios';
import type { Job, ApplicationSubmission, ApplicationResponse } from '../types';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
});

export const getOpenJobs = async (): Promise<Job[]> => {
  const response = await apiClient.get<Job[]>('/jobs');
  return response.data;
};

export const getJobDetails = async (jobId: string): Promise<Job> => {
  const response = await apiClient.get<Job>(`/jobs/${jobId}`);
  return response.data;
};

export const submitGeneralApplication = async (
  payload: ApplicationSubmission
): Promise<ApplicationResponse> => {
  const formData = new FormData();
  formData.append('job_id', payload.job_id);
  formData.append('candidate_name', payload.candidate_name);
  formData.append('candidate_email', payload.candidate_email);
  formData.append('candidate_phone', payload.candidate_phone);
  if (payload.brief_note) {
    formData.append('brief_note', payload.brief_note);
  }
  formData.append('resume', payload.resume);

  const response = await apiClient.post<ApplicationResponse>('/applications', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const submitTargetedJobApplication = async (
  jobId: string,
  payload: Omit<ApplicationSubmission, 'job_id'>
): Promise<ApplicationResponse> => {
  const formData = new FormData();
  formData.append('candidate_name', payload.candidate_name);
  formData.append('candidate_email', payload.candidate_email);
  formData.append('candidate_phone', payload.candidate_phone);
  if (payload.brief_note) {
    formData.append('brief_note', payload.brief_note);
  }
  formData.append('resume', payload.resume);

  const response = await apiClient.post<ApplicationResponse>(`/jobs/${jobId}/apply`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
