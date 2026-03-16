import React, { useCallback } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { openGlobalSheet } from "@/utils/globalSheet";
// Removed CommentsBottomSheet import - using custom implementation instead
import CreatePostSheetUI from "@/components/content/CreatePost";
import DocumentManager from "@/components/content/DocumentManager";
import JobApplicationForm from "@/components/content/JobApplicationForm";

import { Post, DocumentType } from "@/types";

// --- Optional: Main body for job application sheet ---
interface JobApplicationSheetContentProps {
  post: Post;
  onSuccess?: () => void;
  onCancel?: () => void;
}
const JobApplicationSheetContent: React.FC<JobApplicationSheetContentProps> = ({
  post,
  onSuccess,
  onCancel,
}) => {
  return <JobApplicationForm jobPost={post} onSuccess={onSuccess} />;
};

// --- Props interface for the manager ---
interface BottomSheetManagerProps {
  onPostSuccess?: () => void;
}

// --- Wraps content in KeyboardAvoidingView for keyboard safety in all sheets ---
function withKeyboardAvoidance(children: React.ReactNode) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      enabled={true}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

// --- The bottom sheet manager / hook itself ---
export function useBottomSheetManager(props?: BottomSheetManagerProps) {
  const { onPostSuccess } = props || {};

  // Removed openCommentSheet - using custom CommentsBottomSheet instead
  const openCommentSheet = useCallback((postId: string) => {
    console.warn(
      "openCommentSheet is deprecated. Use useCustomCommentsBottomSheet hook instead."
    );
  }, []);

  const openCreatePostSheet = useCallback(() => {
    openGlobalSheet({
      dynamicSnapPoint: true,
      dynamicOptions: {
        minHeight: 400, // Increased minimum height for better keyboard handling
        maxHeight: 0.9, // Increased max height to 90% for better keyboard space
        padding: 80, // Increased padding for better keyboard spacing
      },
      children: withKeyboardAvoidance(
        <CreatePostSheetUI onSuccess={onPostSuccess} />
      ),
    });
  }, [onPostSuccess]);

  const openDocumentsSheet = useCallback(
    (userId?: string, documentType?: DocumentType) => {
      openGlobalSheet({
        dynamicSnapPoint: true,
        dynamicOptions: {
          minHeight: 250,
          maxHeight: 0.8, // 80% max height
          padding: 50,
        },
        children: withKeyboardAvoidance(
          <DocumentManager userId={userId} documentType={documentType} />
        ),
      });
    },
    []
  );

  const openJobApplicationSheet = useCallback(
    (
      post: Post,
      callbacks?: { onSuccess?: () => void; onCancel?: () => void }
    ) => {
      openGlobalSheet({
        dynamicSnapPoint: true,
        dynamicOptions: {
          minHeight: 350,
          maxHeight: 0.9, // 90% max height for job applications
          padding: 60,
        },
        children: withKeyboardAvoidance(
          <JobApplicationSheetContent
            post={post}
            onSuccess={callbacks?.onSuccess}
            onCancel={callbacks?.onCancel}
          />
        ),
      });
    },
    []
  );

  return {
    openCommentSheet,
    openCreatePostSheet,
    openDocumentsSheet,
    openJobApplicationSheet,
  };
}

export default function BottomSheetManager({
  onPostSuccess,
}: BottomSheetManagerProps) {
  return null;
}
