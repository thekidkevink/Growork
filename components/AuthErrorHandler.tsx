import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useFlashToast } from "./ui/Flash";
import { clearAllSupabaseData } from "@/utils/supabase";

interface AuthErrorHandlerProps {
  error: string;
  onRetry?: () => void;
  onSignIn?: () => void;
}

export const AuthErrorHandler: React.FC<AuthErrorHandlerProps> = ({
  error,
  onRetry,
  onSignIn,
}) => {
  const router = useRouter();
  const toast = useFlashToast();

  useEffect(() => {
    const handleAuthError = async () => {
      // Show toast notification
      toast.show({
        type: "danger",
        title: "Authentication Error",
        message: error,
      });

      // Clear session data
      try {
        await clearAllSupabaseData();
      } catch (clearError) {
        console.error("Error clearing session:", clearError);
      }

      // Navigate to login after a short delay
      setTimeout(() => {
        if (onSignIn) {
          onSignIn();
        } else {
          router.replace("/auth/login");
        }
      }, 1000);
    };

    handleAuthError();
  }, [error, onSignIn, router, toast]);

  // Return null since we're handling everything with toast and navigation
  return null;
};

export default AuthErrorHandler;
