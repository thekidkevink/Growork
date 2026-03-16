import { Application, ApplicationStatus } from "@/types";
import { supabase } from "@/utils/supabase";
import { supabaseRequest } from "@/utils/supabaseRequest";
import { useCallback, useState } from "react";
import { sendNotification } from "@/utils/notifications";

export interface ApplicationWithDetails extends Application {
  applicant_name_snapshot?: string | null;
  applicant_phone_snapshot?: string | null;
  job_title_snapshot?: string | null;
  cv_document_id_snapshot?: string | null;
  application_snapshot?: Record<string, any> | null;
  posts: {
    id: string;
    title: string;
    type: string;
    industry: string;
    criteria: any;
  };
  profiles: {
    id: string;
    username: string | null;
    name: string | null;
    surname: string | null;
    full_name?: string | null;
    avatar_url: string | null;
    bio: string | null;
    phone?: string | null;
  };
  company?: {
    id: string;
    name: string;
    logo_url: string | null;
  };
}

export function useMyPostApplications() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolveApplicantId = (application: any) =>
    application.user_id || application.applicant_id;

  const resolvePostId = (application: any) =>
    application.post_id || application.job_id;

  const resolveCompanyId = (post: any) =>
    post?.criteria?.companyId || post?.criteria?.company_id || null;

  const fetchApplicationsForMyPosts = useCallback(
    async (currentUserId: string) => {
      try {
        setLoading(true);
        setError(null);

        const { data: myPosts } = await supabaseRequest<{ id: string }[]>(
          async () => {
            const { data, error, status } = await supabase
              .from("posts")
              .select("id")
              .eq("user_id", currentUserId);
            return { data, error, status };
          },
          { logTag: "incoming:posts" }
        );

        if (!myPosts || myPosts.length === 0) {
          setApplications([]);
          return;
        }

        const postIds = myPosts.map((post) => post.id);

        const { data: applicationsData } = await supabaseRequest<any[]>(
          async () => {
            const { data, error, status } = await supabase
              .from("applications")
              .select(
                `
                *,
                applicant_name_snapshot,
                applicant_phone_snapshot,
                job_title_snapshot,
                cv_document_id_snapshot,
                application_snapshot,
                posts (
                  id,
                  title,
                  type,
                  industry,
                  criteria
                )
              `
              )
              .or(`post_id.in.(${postIds.join(",")}),job_id.in.(${postIds.join(",")})`)
              .order("created_at", { ascending: false });
            return { data, error, status };
          },
          { logTag: "incoming:applications" }
        );

        // Get user IDs from applications to fetch profiles separately
        const userIds = Array.from(
          new Set(
            (applicationsData || [])
              .map((app: any) => resolveApplicantId(app))
              .filter(Boolean)
          )
        );

        const companyIds = Array.from(
          new Set(
            (applicationsData || [])
              .map((app: any) => {
                const postRecord = Array.isArray(app.posts) ? app.posts[0] : app.posts;
                return resolveCompanyId(postRecord);
              })
              .filter(Boolean)
          )
        );

        const [profilesResult, companiesResult] = await Promise.all([
          userIds.length
            ? supabaseRequest<any[]>(
                async () => {
                  const { data, error, status } = await supabase
                    .from("legacy_public_profiles")
                    .select("id, username, name, surname, full_name, avatar_url, bio, phone")
                    .in("id", userIds);
                  return { data, error, status };
                },
                { logTag: "incoming:profiles" }
              )
            : Promise.resolve({ data: [] as any[] }),
          companyIds.length
            ? supabaseRequest<any[]>(
                async () => {
                  const { data, error, status } = await supabase
                    .from("companies")
                    .select("id, name, logo_url")
                    .in("id", companyIds);
                  return { data, error, status };
                },
                { logTag: "incoming:companies" }
              )
            : Promise.resolve({ data: [] as any[] }),
        ]);

        const profilesMap = (profilesResult.data || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        const companiesMap = (companiesResult.data || []).reduce((acc: any, company: any) => {
          acc[company.id] = company;
          return acc;
        }, {});

        // Combine applications with their posts, profiles, and companies
        const applicationsWithProfiles =
          applicationsData?.map((app: any) => {
            const resolvedPostId = resolvePostId(app);
            const applicantId = resolveApplicantId(app);
            const postRecord = Array.isArray(app.posts) ? app.posts[0] : app.posts;
            const post =
              postRecord?.id === resolvedPostId
                ? postRecord
                : postRecord || null;
            const companyId = resolveCompanyId(post);
            const company = companyId ? companiesMap[companyId] : null;
            const liveProfile = profilesMap[applicantId] || null;
            const snapshotApplicant =
              app.application_snapshot?.applicant || null;
            const snapshotFullName =
              app.applicant_name_snapshot ||
              snapshotApplicant?.full_name ||
              null;
            const [snapshotName, ...snapshotSurnameParts] = snapshotFullName
              ? String(snapshotFullName).trim().split(/\s+/)
              : [];
            const syntheticProfile = {
              id: applicantId,
              username: liveProfile?.username || null,
              name: liveProfile?.name || snapshotName || null,
              surname:
                liveProfile?.surname ||
                (snapshotSurnameParts.length
                  ? snapshotSurnameParts.join(" ")
                  : null),
              avatar_url: liveProfile?.avatar_url || null,
              bio: liveProfile?.bio || null,
              phone:
                liveProfile?.phone ||
                app.applicant_phone_snapshot ||
                snapshotApplicant?.phone ||
                null,
            };

            return {
              ...app,
              posts: post,
              profiles: liveProfile || syntheticProfile,
              company: company || null,
            };
          }) || [];

        setApplications(applicationsWithProfiles);
      } catch (err: any) {
        console.error("Error fetching applications for my posts:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      try {
        const { error } = await supabase
          .from("applications")
          .update({ status })
          .eq("id", applicationId);

        if (error) {
          throw error;
        }

        // Send notification to the applicant
        try {
          // Get application details to find the applicant
        const { data: applicationData } = await supabase
          .from("applications")
          .select(
            `
            user_id,
            applicant_id,
            post_id,
            posts (
              title
            )
          `
            )
            .eq("id", applicationId)
            .single();

          if (applicationData) {
            const postRecord = Array.isArray(applicationData.posts)
              ? applicationData.posts[0]
              : applicationData.posts;
            const jobTitle = postRecord?.title || "your application";
            const statusText = status.charAt(0).toUpperCase() + status.slice(1);

            await sendNotification(
              applicationData.user_id || applicationData.applicant_id,
              "Application Status Update",
              `Your application for "${jobTitle}" has been ${statusText}`,
              "application_status",
              { applicationId, status, jobTitle }
            );
          }
        } catch (notificationError) {
          console.error(
            "Failed to send application status notification:",
            notificationError
          );
          // Don't fail the status update if notification fails
        }

        // Update the local state
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status } : app
          )
        );

        return { error: null };
      } catch (err: any) {
        console.error("Error updating application status:", err);
        return { error: err };
      }
    },
    []
  );

  const filterApplicationsByStatus = useCallback(
    (status?: ApplicationStatus) => {
      if (!status) return applications;
      return applications.filter((app) => app.status === status);
    },
    [applications]
  );

  const filterApplicationsByPost = useCallback(
    (postId: string) => {
      return applications.filter(
        (app) => app.post_id === postId || app.job_id === postId
      );
    },
    [applications]
  );

  return {
    applications,
    loading,
    error,
    fetchApplicationsForMyPosts,
    updateApplicationStatus,
    filterApplicationsByStatus,
    filterApplicationsByPost,
  };
}
