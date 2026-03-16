export interface Company {
  id: string;
  name: string;
  logo: string;
  verified: boolean;
}

export interface Post {
  image_url: string | undefined;
  id: string;
  title: string;
  company: Company;
  location: string;
  type: string; // Full-time, Part-time, Contract, etc.
  remote: boolean;
  description: string;
  requirements: string[];
  image?: string;
  isHiring: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecommendedPost {
  id: string;
  title: string;
  company: {
    name: string;
    logo: string;
  };
  location: string;
  remote: boolean;
}