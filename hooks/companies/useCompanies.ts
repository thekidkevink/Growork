import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { Company } from "@/types/company";
import { supabase } from "@/utils/supabase";

const VALID_COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const normalizeCompany = (company: any): Company => ({
  ...company,
  user_id: company.user_id ?? company.owner_id ?? "",
  status: company.status ?? company.verification_status ?? "pending",
});

const normalizeCompanyArray = (companies: any[] | null | undefined): Company[] =>
  (companies ?? []).map(normalizeCompany);

const sanitizeCompanyPayload = (
  userId: string,
  payload: Partial<Company>
): Record<string, unknown> => ({
  ...payload,
  size: payload.size && payload.size.trim() ? payload.size : null,
  founded_year: payload.founded_year ?? null,
  user_id: userId,
  owner_id: userId,
  status: payload.status ?? "pending",
});

export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setCompanies([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("*")
        .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCompanies(normalizeCompanyArray(data));
    } catch (err: any) {
      console.error("Error fetching companies:", err.message);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCompany = useCallback(
    async (companyData: Partial<Company>) => {
      if (!user) return { error: "User not authenticated" };

      try {
        if (
          companyData.size !== undefined &&
          companyData.size !== null &&
          companyData.size !== "" &&
          !VALID_COMPANY_SIZES.includes(companyData.size)
        ) {
          return {
            error: `Invalid company size. Must be one of: ${VALID_COMPANY_SIZES.join(
              ", "
            )}`,
          };
        }

        const cleanedData = sanitizeCompanyPayload(user.id, companyData);

        const { data, error } = await supabase
          .from("companies")
          .insert([cleanedData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        const normalized = normalizeCompany(data);
        setCompanies((prev) => [normalized, ...prev]);
        return { company: normalized };
      } catch (err: any) {
        console.error("Error creating company:", err.message);
        return { error: err.message };
      }
    },
    [user]
  );

  const updateCompany = useCallback(
    async (id: string, updates: Partial<Company>) => {
      if (
        updates.size !== undefined &&
        updates.size !== null &&
        updates.size !== "" &&
        !VALID_COMPANY_SIZES.includes(updates.size)
      ) {
        return {
          error: `Invalid company size. Must be one of: ${VALID_COMPANY_SIZES.join(
            ", "
          )}`,
        };
      }

      try {
        const cleanedUpdates = {
          ...updates,
          size: updates.size && updates.size.trim() ? updates.size : null,
        };

        const { data, error } = await supabase
          .from("companies")
          .update(cleanedUpdates)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        const normalized = normalizeCompany(data);
        setCompanies((prev) =>
          prev.map((company) => (company.id === id ? normalized : company))
        );
        return { company: normalized };
      } catch (err: any) {
        console.error("Error updating company:", err.message);
        return { error: err.message };
      }
    },
    []
  );

  const deleteCompany = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("companies").delete().eq("id", id);

      if (error) throw error;

      setCompanies((prev) => prev.filter((company) => company.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error("Error deleting company:", err.message);
      return { error: err.message };
    }
  }, []);

  const getCompanyById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { company: data ? normalizeCompany(data) : null };
    } catch (err: any) {
      console.error("Error getting company by id:", err.message);
      return { error: err.message };
    }
  }, []);

  const getCompanyByIdPublic = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return { company: data ? normalizeCompany(data) : null };
    } catch (err: any) {
      console.error("Error fetching company:", err.message);
      return { error: err.message };
    }
  }, []);

  const getCompanyByUserId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .or(`user_id.eq.${userId},owner_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      return {
        company: data && data.length > 0 ? normalizeCompany(data[0]) : null,
      };
    } catch (err: any) {
      console.error("Error fetching company by user ID:", err.message);
      return { error: err.message || "An error occurred" };
    }
  }, []);

  const getAllCompaniesByUserId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .or(`user_id.eq.${userId},owner_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return { companies: normalizeCompanyArray(data) };
    } catch (err: any) {
      console.error("Error fetching all companies by user ID:", err.message);
      return { error: err.message };
    }
  }, []);

  const debugCompanyTable = useCallback(async () => {
    try {
      await supabase
        .from("companies")
        .select("*", { count: "exact", head: true });
    } catch (err: any) {
      console.error("Error in debug function:", err);
    }
  }, []);

  const updateCompanyLogo = useCallback(async (id: string, logoUrl: string) => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .update({ logo_url: logoUrl })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const normalized = normalizeCompany(data);
      setCompanies((prev) =>
        prev.map((company) => (company.id === id ? normalized : company))
      );
      return { company: normalized };
    } catch (err: any) {
      console.error("Error updating company logo:", err.message);
      return { error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    updateCompanyLogo,
    deleteCompany,
    getCompanyById,
    getCompanyByIdPublic,
    getCompanyByUserId,
    getAllCompaniesByUserId,
    debugCompanyTable,
  };
};
