export interface CompanyMembership {
  companyId: string;
  ownerUserId: string;
  role: 'owner' | 'manager';
}

export interface BusinessUnlockState {
  hasBusinessCapability: boolean;
  memberships: CompanyMembership[];
}
