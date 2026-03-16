import { PostType } from './enums';

export interface Post {
  id: string;
  user_id: string;
  type: PostType;
  title: string | null;
  content: string | null;
  image_url: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  industry: string | null;
  criteria: {
    // Job fields
    company?: string;
    companyId?: string; // Link to company profile
    company_id?: string;
    companyLogo?: string;
    location?: string;
    salary?: string;
    jobType?: string;
    requirements?: string[];
    benefits?: string[];
    deadline?: string;
    // Article fields
    source?: string;
    summary?: string;
    tags?: string[];
    author?: string;
    publication_date?: string;
    // Extendable for future types
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string | null;
  is_sponsored: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
}
