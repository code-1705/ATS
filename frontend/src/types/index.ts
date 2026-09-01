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
}
