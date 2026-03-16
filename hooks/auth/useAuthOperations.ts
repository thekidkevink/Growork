import { useCallback, useRef } from 'react';
import { supabase } from '../../utils/supabase';
import { supabaseRequest } from '../../utils/supabaseRequest';
import { ensureUserProfile } from '../../utils/profileUtils';
import type { Profile } from '../../types';

export function useAuthOperations() {
  const profileLoaded = useRef(false);
  const profileFetching = useRef(false);

  // Fetch user profile from database (always fresh data)
  const fetchUserProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (profileFetching.current) return null;

    try {
      profileFetching.current = true;

      // Always fetch fresh data from database (with retry/abort handling)
      const { data: profile } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          return { data, error, status };
        },
        { logTag: 'profiles:getForAuth' }
      );

      if (!profile) {
        // If profile doesn't exist, try to create one
        // Note: supabaseRequest throws on non-200 errors, so only reach here when data is null
        // Attempt ensureUserProfile which will internally fetch/create
        console.warn('Profile not found, attempting to create one for user:', userId);
        const createdProfile = await ensureUserProfile(userId);
        if (createdProfile) {
          profileLoaded.current = true;
          return createdProfile;
        }

        return null;
      }

      if (profile) {
        profileLoaded.current = true;
        return profile;
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    } finally {
      profileFetching.current = false;
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      if (updatedProfile) {
        profileLoaded.current = false;
        return updatedProfile;
      }

      return null;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return null;
    }
  }, []);

  // Force refresh profile from database (always fresh data)
  const forceRefreshProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Reset profile loaded state
      profileLoaded.current = false;

      // Fetch fresh data from database
      return await fetchUserProfile(userId);
    } catch (error) {
      console.error('Error force refreshing profile:', error);
      return null;
    }
  }, [fetchUserProfile]);

  // Check if profile is loaded
  const isProfileLoaded = useCallback(() => profileLoaded.current, []);

  return {
    fetchUserProfile,
    updateUserProfile,
    forceRefreshProfile,
    isProfileLoaded,
  };
}
