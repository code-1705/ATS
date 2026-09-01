import axios from 'axios';
import type {
  Job,
  JobCreatePayload,
  JobUpdatePayload,
  ApplicationResponse,
  ApplicationDetailResponse,
  TokenResponse,
  AdminUser,
  ApplicationStage
} from '../types';

const TOKEN_KEY = 'enterrecruit_token';

const adminClient = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
  },
});

// Auto-inject JWT token if present
adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Helpers
export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};

// Authentication Endpoints
export const loginAdmin = async (email: string, password: string): Promise<TokenResponse> => {
  const response = await adminClient.post<TokenResponse>('/auth/login', { email, password });
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
  }
  return response.data;
};

export const getAdminProfile = async (): Promise<AdminUser> => {
  const response = await adminClient.get<AdminUser>('/auth/me');
  return response.data;
};

// Admin Job CRUD Endpoints
export const getAdminJobs = async (): Promise<Job[]> => {
  const response = await adminClient.get<{ total: number; jobs: Job[] }>('/admin/jobs');
  return response.data.jobs;
};

export const createAdminJob = async (payload: JobCreatePayload): Promise<Job> => {
  const response = await adminClient.post<Job>('/admin/jobs', payload);
  return response.data;
};

export const updateAdminJob = async (jobId: string, payload: JobUpdatePayload): Promise<Job> => {
  const response = await adminClient.put<Job>(`/admin/jobs/${jobId}`, payload);
  return response.data;
};

export const deleteAdminJob = async (jobId: string): Promise<void> => {
  await adminClient.delete(`/admin/jobs/${jobId}`);
};

// Admin Applications & Pipeline Endpoints
export interface ApplicationQueryParams {
  job_id?: string;
  stage?: string;
  search?: string;
}

export const getAdminApplications = async (
  params?: ApplicationQueryParams
): Promise<ApplicationResponse[]> => {
  const response = await adminClient.get<{ total: number; applications: ApplicationResponse[] }>(
    '/admin/applications',
    { params }
  );
  return response.data.applications;
};

export const getApplicationDetails = async (
  applicationId: string
): Promise<ApplicationDetailResponse> => {
  const response = await adminClient.get<ApplicationDetailResponse>(
    `/admin/applications/${applicationId}`
  );
  return response.data;
};

export const updateApplicationStage = async (
  applicationId: string,
  stage: ApplicationStage
): Promise<ApplicationResponse> => {
  const response = await adminClient.patch<ApplicationResponse>(
    `/admin/applications/${applicationId}/stage`,
    { stage }
  );
  return response.data;
};
