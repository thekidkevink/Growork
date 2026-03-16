import { ApplicationStatus } from './enums';

export interface Application {
  id: string;
  user_id: string;
  applicant_id?: string | null;
  post_id: string;
  job_id?: string | null;
  resume_id: string | null;
  cover_letter_id: string | null;
  resume_url: string | null;
  cover_letter: string | null;
  status: ApplicationStatus;
  applicant_name_snapshot?: string | null;
  applicant_phone_snapshot?: string | null;
  job_title_snapshot?: string | null;
  cv_document_id_snapshot?: string | null;
  application_snapshot?: Record<string, any> | null;
  created_at: string;
} 
