export type ApplicationStage =
  | 'APPLIED'
  | 'REJECT'
  | 'R1'
  | 'R1_REJECT'
  | 'R2'
  | 'R2_REJECT'
  | 'R3'
  | 'R3_REJECT'
  | 'APPROVED';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  job_type: string;
  description: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  applications_count?: number;
}

export interface JobCreatePayload {
  title: string;
  department: string;
  location?: string;
  job_type?: string;
  description: string;
  is_active?: boolean;
}

export interface JobUpdatePayload {
  title?: string;
  department?: string;
  location?: string;
  job_type?: string;
  description?: string;
  is_active?: boolean;
}

export interface ApplicationSubmission {
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  brief_note?: string;
  resume: File;
}

export interface ApplicationResponse {
  id: string;
  job_id: string;
  job_title?: string;
  job_department?: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string;
  resume_url: string;
  resume_filename: string;
  resume_file_size: number;
  brief_note?: string;
  stage: string;
  stage_label?: string;
  stage_updated_at?: string;
  created_at?: string;
  valid_next_stages?: ApplicationStage[];
}


export interface AuditLog {
  id: number;
  application_id: string;
  from_stage: string;
  to_stage: string;
  changed_by: string;
  created_at: string;
}

export interface ApplicationDetailResponse extends ApplicationResponse {
  audit_logs?: AuditLog[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: AdminUser;
}
