import type {
  CapabilityContext,
  CapabilitySnapshot,
} from '@/src/features/capabilities/domain/capabilities';

function hasCompanyRelationship(context: CapabilityContext): boolean {
  return Boolean(
    context.ownedCompanyIds?.length || context.managedCompanyIds?.length
  );
}

function hasBusinessProfile(context: CapabilityContext): boolean {
  return context.userType === "business";
}

export function isAdmin(context: CapabilityContext): boolean {
  return context.profileRole === 'admin' || context.userType === 'admin';
}

export function hasBusinessCapability(context: CapabilityContext): boolean {
  return (
    isAdmin(context) ||
    hasBusinessProfile(context) ||
    hasCompanyRelationship(context)
  );
}

export function canPostJobs(context: CapabilityContext): boolean {
  return hasBusinessCapability(context);
}

export function canManageApplicants(context: CapabilityContext): boolean {
  return hasBusinessCapability(context);
}

export function buildCapabilitySnapshot(
  context: CapabilityContext
): CapabilitySnapshot {
  return {
    isAdmin: isAdmin(context),
    hasBusinessCapability: hasBusinessCapability(context),
    canPostJobs: canPostJobs(context),
    canManageApplicants: canManageApplicants(context),
  };
}
