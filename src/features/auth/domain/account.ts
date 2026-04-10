export type PublicAccountType = 'user' | 'business' | 'admin';

export interface AccountProfile {
  id: string;
  email?: string | null;
  username: string | null;
  firstName: string | null;
  surname: string | null;
  fullName: string | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  userType: PublicAccountType;
  phone: string | null;
  location: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface AccountIdentity {
  userId: string;
  email: string;
}

export interface BusinessCapabilitySummary {
  ownsCompanyIds: string[];
  managesCompanyIds: string[];
}
