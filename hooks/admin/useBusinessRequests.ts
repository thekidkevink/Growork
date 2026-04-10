import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import { useAuth } from "@/hooks/auth";
import { BusinessAccountRequest, BusinessRequestStatus, ProfileRole } from "@/types";
import { supabase } from "@/utils/supabase";

type CreateBusinessRequestInput = {
  full_name: string;
  phone?: string | null;
  profession?: string | null;
  company_name?: string | null;
  industry?: string | null;
  location?: string | null;
  message?: string | null;
};

let sharedAdminRequests: BusinessAccountRequest[] = [];
const adminRequestListeners = new Set<
  Dispatch<SetStateAction<BusinessAccountRequest[]>>
>();

function broadcastAdminRequests(next: BusinessAccountRequest[]) {
  sharedAdminRequests = next;
  adminRequestListeners.forEach((listener) => listener(next));
}

export function useBusinessRequests() {
  const { user, profile, refreshProfile } = useAuth();
  const [requests, setRequests] = useState<BusinessAccountRequest[]>(sharedAdminRequests);
  const [myLatestRequest, setMyLatestRequest] = useState<BusinessAccountRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [myRequestLoading, setMyRequestLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async (status?: BusinessRequestStatus) => {
    if (!user || profile?.profile_role !== ProfileRole.Admin) {
      broadcastAdminRequests([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("business_account_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error: queryError } = await query;
      if (queryError) {
        throw queryError;
      }

      const mapped = (data || []) as BusinessAccountRequest[];
      if (status) {
        const otherStatuses = sharedAdminRequests.filter(
          (request) => request.status !== status
        );
        broadcastAdminRequests([...otherStatuses, ...mapped]);
      } else {
        broadcastAdminRequests(mapped);
      }
      return mapped;
    } catch (err: any) {
      setError(err.message || "Failed to load business requests.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [profile?.profile_role, user]);

  const fetchMyLatestRequest = useCallback(async () => {
    if (!user?.id) {
      setMyRequestLoading(false);
      setMyLatestRequest(null);
      return null;
    }

    try {
      setMyRequestLoading(true);
      const { data, error: queryError } = await supabase
        .from("business_account_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      const request = (data as BusinessAccountRequest | null) ?? null;
      setMyLatestRequest(request);
      return request;
    } catch (err: any) {
      setError(err.message || "Failed to load your business request.");
      setMyLatestRequest(null);
      return null;
    } finally {
      setMyRequestLoading(false);
    }
  }, [user?.id]);

  const createRequest = useCallback(async (payload: CreateBusinessRequestInput) => {
    if (!user?.id) {
      return { error: "You need to be signed in." };
    }

    try {
      setSubmitting(true);
      setError(null);

      const existingPending = await supabase
        .from("business_account_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();

      if (existingPending.data?.id) {
        return { error: "You already have a pending business account request." };
      }

      const { data, error: insertError } = await supabase
        .from("business_account_requests")
        .insert({
          user_id: user.id,
          email: user.email ?? null,
          full_name: payload.full_name,
          phone: payload.phone || null,
          profession: payload.profession || null,
          company_name: payload.company_name || null,
          industry: payload.industry || null,
          location: payload.location || null,
          message: payload.message || null,
          status: "pending",
        })
        .select("*")
        .single();

      if (insertError) {
        throw insertError;
      }

      const request = data as BusinessAccountRequest;
      setMyLatestRequest(request);
      return { request };
    } catch (err: any) {
      setError(err.message || "Failed to submit business request.");
      return { error: err.message || "Failed to submit business request." };
    } finally {
      setSubmitting(false);
    }
  }, [user?.email, user?.id]);

  const retractRequest = useCallback(async (requestId: string) => {
    if (!user?.id) {
      return { error: "You need to be signed in." };
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data: request, error: requestError } = await supabase
        .from("business_account_requests")
        .select("id, user_id, status")
        .eq("id", requestId)
        .maybeSingle();

      if (requestError) {
        throw requestError;
      }

      if (!request || request.user_id !== user.id) {
        return { error: "Request not found." };
      }

      if (request.status !== "pending") {
        return { error: "Only pending requests can be retracted." };
      }

      const { error: deleteError } = await supabase
        .from("business_account_requests")
        .delete()
        .eq("id", requestId)
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (deleteError) {
        throw deleteError;
      }

      setMyLatestRequest(null);
      broadcastAdminRequests(
        sharedAdminRequests.filter((item) => item.id !== requestId)
      );
      return { success: true };
    } catch (err: any) {
      setError(err.message || "Failed to retract request.");
      return { error: err.message || "Failed to retract request." };
    } finally {
      setSubmitting(false);
    }
  }, [user?.id]);

  const reviewRequest = useCallback(async (
    requestId: string,
    status: Exclude<BusinessRequestStatus, "pending">,
    adminNotes?: string
  ) => {
    if (!user?.id || profile?.profile_role !== ProfileRole.Admin) {
      return { error: "You do not have permission to review requests." };
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc(
        "review_business_account_request",
        {
          p_request_id: requestId,
          p_status: status,
          p_admin_notes: adminNotes || null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      const nextRequest = data as BusinessAccountRequest;
      const existsInCache = sharedAdminRequests.some(
        (item) => item.id === requestId
      );

      broadcastAdminRequests(
        existsInCache
          ? sharedAdminRequests.map((item) =>
              item.id === requestId ? nextRequest : item
            )
          : [nextRequest, ...sharedAdminRequests]
      );

      void refreshProfile();
      return { request: nextRequest };
    } catch (err: any) {
      setError(err.message || "Failed to review request.");
      return { error: err.message || "Failed to review request." };
    } finally {
      setSubmitting(false);
    }
  }, [profile?.profile_role, refreshProfile, user?.id]);

  const retractApproval = useCallback(async (requestId: string) => {
    if (!user?.id || profile?.profile_role !== ProfileRole.Admin) {
      return { error: "You do not have permission to retract approvals." };
    }

    try {
      setSubmitting(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc(
        "retract_business_account_approval",
        {
          p_request_id: requestId,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      const nextRequest = data as BusinessAccountRequest;
      const existsInCache = sharedAdminRequests.some(
        (item) => item.id === requestId
      );

      broadcastAdminRequests(
        existsInCache
          ? sharedAdminRequests.map((item) =>
              item.id === requestId ? nextRequest : item
            )
          : [nextRequest, ...sharedAdminRequests]
      );

      void refreshProfile();
      return { request: nextRequest };
    } catch (err: any) {
      setError(err.message || "Failed to retract approval.");
      return { error: err.message || "Failed to retract approval." };
    } finally {
      setSubmitting(false);
    }
  }, [profile?.profile_role, refreshProfile, user?.id]);

  useEffect(() => {
    adminRequestListeners.add(setRequests);
    setRequests(sharedAdminRequests);

    return () => {
      adminRequestListeners.delete(setRequests);
    };
  }, []);

  useEffect(() => {
    if (profile?.profile_role === ProfileRole.Admin) {
      void fetchRequests();
    }
  }, [fetchRequests, profile?.profile_role]);

  useEffect(() => {
    if (user?.id) {
      void fetchMyLatestRequest();
    }
  }, [fetchMyLatestRequest, user?.id]);

  return {
    requests,
    myLatestRequest,
    loading,
    myRequestLoading,
    submitting,
    error,
    fetchRequests,
    fetchMyLatestRequest,
    createRequest,
    retractRequest,
    retractApproval,
    reviewRequest,
  };
}
