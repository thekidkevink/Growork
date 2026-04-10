import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserType } from '../../types/enums';
import { useCompanies } from '@/hooks/companies/useCompanies';
import { buildCapabilitySnapshot } from '@/src/features/capabilities/services/capabilityHelpers';


export type PermissionAction =
    | 'create:post'
    | 'apply:job'
    | 'manage:company'
    | 'view:analytics'
    | 'review:business-requests'
    | string;


export interface Permissions {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isBusinessUser: boolean;
    isRegularUser: boolean;
    userType: UserType | undefined;
    hasUserType: (type: UserType) => boolean;
    can: (action: PermissionAction, resource?: unknown) => boolean;
}

export function usePermissions(): Permissions & { refresh: () => Promise<void> } {
    const { user, profile, refreshProfile } = useAuth();
    const { companies } = useCompanies();

    const isAuthenticated = Boolean(user);
    // Safely get and validate the user type
    const userType = useMemo(() => {
      const type = profile?.user_type?.toLowerCase();
      if (type === UserType.Business) return UserType.Business;
      if (type === UserType.User) return UserType.User;
      return undefined;
    }, [profile?.user_type]);

    const capabilitySnapshot = useMemo(
      () =>
        buildCapabilitySnapshot({
          profileRole: profile?.profile_role ?? null,
          userType: userType ?? null,
          ownedCompanyIds: companies.map((company) => company.id),
          managedCompanyIds: companies.map((company) => company.id),
        }),
      [companies, profile?.profile_role, userType]
    );

    const isAdmin = capabilitySnapshot.isAdmin;
    const isBusinessUser = capabilitySnapshot.hasBusinessCapability;
    const isRegularUser =
      isAuthenticated && !capabilitySnapshot.hasBusinessCapability && !capabilitySnapshot.isAdmin;

    const hasUserType = (type: UserType) => userType === type;

    const can = (action: PermissionAction): boolean => {
        switch (action) {
            case 'create:post':
            case 'manage:company':
            case 'view:analytics':
                return capabilitySnapshot.canPostJobs;

            case 'manage:applicants':
                return capabilitySnapshot.canManageApplicants;

            case 'review:business-requests':
                return capabilitySnapshot.isAdmin;

            case 'apply:job':
                return isAuthenticated; // Allow signed-in users to apply

            default:
                // Unknown actions default to signed-in check
                return isAuthenticated;
        }
    };

    const refresh = useCallback(async () => {
        if (refreshProfile) {
            await refreshProfile();
        }
    }, [refreshProfile]);

    return {
        isAuthenticated,
        isAdmin,
        isBusinessUser,
        isRegularUser,
        userType,
        hasUserType,
        can,
        refresh,
    };
}
