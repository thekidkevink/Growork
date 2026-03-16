import { supabase } from "./supabase";
import type { Profile } from "../types";

const PROFILE_TRIGGER_RETRY_DELAYS_MS = [150, 400, 900];

function isRlsWriteError(error: { code?: string; message?: string } | null) {
  if (!error) return false;

  return (
    error.code === "42501" ||
    error.message?.toLowerCase().includes("row-level security") === true
  );
}

async function fetchProfileById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking existing profile:", error);
    return null;
  }

  return (data as Profile | null) ?? null;
}

async function waitForTriggeredProfile(userId: string): Promise<Profile | null> {
  for (const delayMs of PROFILE_TRIGGER_RETRY_DELAYS_MS) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    const profile = await fetchProfileById(userId);
    if (profile) {
      return profile;
    }
  }

  return null;
}

/**
 * Syncs profile fields if the profile already exists. The backend is expected
 * to create the row via auth/database triggers, so this function should never
 * create a new `profiles` row from the client.
 */
export async function createProfileIfNotExists(
  userId: string,
  profileData: {
    username: string;
    name: string;
    surname: string;
    user_type?: "user" | "business";
  }
): Promise<Profile | null> {
  try {
    const existingProfile =
      (await fetchProfileById(userId)) ?? (await waitForTriggeredProfile(userId));

    if (!existingProfile) {
      console.warn(
        "Profile row is not readable yet after signup; relying on backend trigger to complete setup."
      );
      return null;
    }

    const needsUpdate =
      existingProfile.username !== profileData.username ||
      existingProfile.name !== profileData.name ||
      existingProfile.surname !== profileData.surname ||
      existingProfile.user_type !== (profileData.user_type || "user");

    if (!needsUpdate) {
      return existingProfile;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        username: profileData.username,
        name: profileData.name,
        surname: profileData.surname,
        user_type: profileData.user_type || "user",
      })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) {
      if (isRlsWriteError(updateError)) {
        console.warn(
          "Profile exists but client-side profile sync is blocked by RLS; keeping backend-managed row as-is."
        );
        return existingProfile;
      }

      console.error("Error updating existing profile:", updateError);
      return existingProfile;
    }

    return (updatedProfile as Profile | null) ?? existingProfile;
  } catch (error) {
    console.error("Error in createProfileIfNotExists:", error);
    return null;
  }
}

/**
 * Ensures a user has a readable profile row. If the database trigger has not
 * made it visible yet, we wait briefly and then give up without attempting a
 * client-side insert that would violate RLS.
 */
export async function ensureUserProfile(userId: string): Promise<Profile | null> {
  try {
    const profile =
      (await fetchProfileById(userId)) ?? (await waitForTriggeredProfile(userId));

    if (!profile) {
      console.warn(
        "Profile row is still unavailable after retrying; skipping client-side creation because profiles are backend-managed."
      );
    }

    return profile;
  } catch (error) {
    console.error("Error in ensureUserProfile:", error);
    return null;
  }
}
