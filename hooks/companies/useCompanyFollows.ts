import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/utils/supabase";
import { useAuth } from "../auth/useAuth";
import { Company } from "@/types";

export function useCompanyFollows() {
  const { profile } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid circular dependencies
  const fetchFollowedCompaniesRef = useRef<(() => Promise<void>) | undefined>(
    undefined
  );
  const profileRef = useRef(profile);

  // Update refs when values change
  useEffect(() => {
    fetchFollowedCompaniesRef.current = fetchFollowedCompanies;
    profileRef.current = profile;
  });

  const fetchFollowedCompanies = useCallback(async () => {
    if (!profile?.id) {
      setCompanies([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data, error: queryError } = await supabase
        .from("company_follows")
        .select("company:companies(*)")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      const mapped: Company[] = (data || [])
        .map((row: any) => row.company)
        .filter(Boolean);
      setCompanies(mapped);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching followed companies:", err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  const unfollowCompany = useCallback(
    async (companyId: string) => {
      if (!profile?.id) return { error: "Not authenticated" };
      try {
        const { error: delError } = await supabase
          .from("company_follows")
          .delete()
          .eq("profile_id", profile.id)
          .eq("company_id", companyId);
        if (delError) return { error: delError.message };

        // Call the ref function directly to avoid dependency issues
        if (fetchFollowedCompaniesRef.current) {
          await fetchFollowedCompaniesRef.current();
        }
        return { success: true };
      } catch (err: any) {
        return { error: err.message };
      }
    },
    [profile?.id]
  );

  const isFollowingCompany = useCallback(
    async (companyId: string) => {
      if (!profile?.id) return false;
      try {
        const { data, error } = await supabase
          .from("company_follows")
          .select("*")
          .eq("profile_id", profile.id)
          .eq("company_id", companyId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking follow status:", error);
          return false;
        }

        return !!data;
      } catch (err: any) {
        console.error("Error checking follow status:", err);
        return false;
      }
    },
    [profile?.id]
  );

  const followCompany = useCallback(
    async (companyId: string) => {
      if (!profile?.id) return { error: "Not authenticated" };
      try {
        const alreadyFollowing = await isFollowingCompany(companyId);
        if (alreadyFollowing) {
          return { success: true };
        }

        const { error: insertError } = await supabase
          .from("company_follows")
          .insert({ profile_id: profile.id, company_id: companyId });
        if (insertError) {
          if (insertError.code === "23505") {
            return { success: true };
          }
          return { error: insertError.message };
        }

        if (fetchFollowedCompaniesRef.current) {
          await fetchFollowedCompaniesRef.current();
        }
        return { success: true };
      } catch (err: any) {
        console.error("Follow company error:", err);
        return { error: err.message };
      }
    },
    [profile?.id, isFollowingCompany]
  );

  useEffect(() => {
    if (profile?.id) {
      fetchFollowedCompanies();
    } else {
      setCompanies([]);
    }
  }, [profile?.id, fetchFollowedCompanies]);

  return {
    companies,
    loading,
    error,
    fetchFollowedCompanies,
    followCompany,
    unfollowCompany,
    isFollowingCompany,
  };
}
