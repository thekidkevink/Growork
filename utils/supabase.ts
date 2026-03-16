import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { checkNetworkStatus } from "./networkUtils";

const withTimeout = async (
  input: RequestInfo | URL | string,
  init: RequestInit = {},
  timeoutMs = 60000
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input as any, {
      ...init,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(id);
  }
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
    global: {
      headers: {
        "X-Client-Info": "growork-app",
      },
      fetch: (input: RequestInfo | URL | string, init?: RequestInit) =>
        withTimeout(input, init, 60000),
    },
    db: {
      schema: "public",
    },
    realtime: {
      timeout: 20000,
    },
  }
);

export const clearAllSupabaseData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const supabaseKeys = keys.filter(
      (key) =>
        key.includes("supabase") ||
        key.includes("sb-") ||
        key.startsWith("supabase.")
    );

    if (supabaseKeys.length > 0) {
      await AsyncStorage.multiRemove(supabaseKeys);
      console.log("Cleared Supabase session data");
    }
  } catch (error) {
    console.error("Error clearing Supabase data:", error);
  }
};

// Handle Supabase authentication errors
export const handleAuthError = async (
  error: any
): Promise<{ shouldSignOut: boolean; userMessage: string }> => {
  const errorMessage = error?.message?.toLowerCase() || "";

  // Check for refresh token errors
  if (
    errorMessage.includes("invalid refresh token") ||
    errorMessage.includes("refresh token not found") ||
    errorMessage.includes("refresh token has expired")
  ) {
    console.log(
      "🔄 Invalid refresh token detected, clearing session and signing out..."
    );

    // Clear all Supabase session data
    await clearAllSupabaseData();

    // Try to sign out from Supabase
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.log("Error during sign out:", signOutError);
    }

    return {
      shouldSignOut: true,
      userMessage: "Your session has expired. Please sign in again.",
    };
  }

  // Check for JWT token errors
  if (
    errorMessage.includes("jwt") ||
    errorMessage.includes("token") ||
    errorMessage.includes("unauthorized")
  ) {
    console.log("🔐 Authentication token error detected");

    return {
      shouldSignOut: true,
      userMessage: "Authentication failed. Please sign in again.",
    };
  }

  // Check for connection/network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return {
      shouldSignOut: false,
      userMessage:
        "Network connection error. Please check your internet connection.",
    };
  }

  // Default error handling
  return {
    shouldSignOut: false,
    userMessage: error?.message || "An authentication error occurred.",
  };
};

// Enhanced Supabase request wrapper with auth error handling
export const supabaseRequestWithAuth = async <T>(
  requestFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    onAuthError?: (userMessage: string) => void;
    logTag?: string;
  } = {}
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await requestFn();

    // Check if the error is an auth error
    if (result.error) {
      const { shouldSignOut, userMessage } = await handleAuthError(
        result.error
      );

      if (shouldSignOut && options.onAuthError) {
        options.onAuthError(userMessage);
        return { data: null, error: new Error(userMessage) };
      }
    }

    return result;
  } catch (error) {
    console.error(
      `❌ Supabase request error${
        options.logTag ? ` (${options.logTag})` : ""
      }:`,
      error
    );

    const { shouldSignOut, userMessage } = await handleAuthError(error);

    if (shouldSignOut && options.onAuthError) {
      options.onAuthError(userMessage);
      return { data: null, error: new Error(userMessage) };
    }

    return { data: null, error };
  }
};

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log("🔍 Testing Supabase connection...");

    // Check network connectivity first
    const networkStatus = await checkNetworkStatus();
    if (!networkStatus.isConnected) {
      console.error("❌ No internet connection detected");
      return false;
    }

    // Test basic connection against a compatibility view that is safe for
    // startup/anonymous access under the current RLS model.
    const { error } = await supabase
      .from("legacy_public_profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Supabase connection test failed:", error);
      return false;
    }

    console.log("✅ Supabase connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Supabase connection test error:", error);
    return false;
  }
};
