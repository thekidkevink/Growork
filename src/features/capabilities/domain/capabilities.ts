export interface CapabilityContext {
  profileRole?: string | null;
  userType?: string | null;
  ownedCompanyIds?: string[];
  managedCompanyIds?: string[];
}

export interface CapabilitySnapshot {
  isAdmin: boolean;
  hasBusinessCapability: boolean;
  canPostJobs: boolean;
  canManageApplicants: boolean;
}
