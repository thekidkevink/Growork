
export interface Profile {
  id: string; // uuid
  username: string | null;
  full_name?: string | null;
  name: string;
  surname: string;
  avatar_url: string | null;
  bio: string | null;
  user_type: import('./enums').UserType;
  website: string | null;
  phone: string | null;
  location: string | null;
  profession: string | null;
  experience_years: number | null;
  education: string | null;
  skills: string[] | null;
  created_at: string; // ISO timestamp
  updated_at: string | null;
}

export interface ProfileFormData {
  name: string;
  surname: string;
  username: string;
  bio: string;
  user_type: import('./enums').UserType;
  website: string;
  phone: string;
  location: string;
  profession: string;
  experience_years: string;
  education: string;
  skills: string;
} 
