export interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  impressions: number;
  clicks: number;
} 