export type BusinessRequestStatus = "pending" | "approved" | "rejected";

export interface BusinessAccountRequest {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  profession: string | null;
  company_name: string | null;
  industry: string | null;
  location: string | null;
  message: string | null;
  status: BusinessRequestStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string | null;
}
