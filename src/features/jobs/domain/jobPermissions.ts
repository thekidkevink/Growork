export interface JobPostPermissionContext {
  userId: string;
  companyIds: string[];
}

export function canCreateListing(context: JobPostPermissionContext): boolean {
  return context.companyIds.length > 0;
}
