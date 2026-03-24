import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { openGlobalSheet } from "@/utils/globalSheet";
import PostForm from "./post/PostForm";
import { Post } from "@/types";

interface CreatePostSheetUIProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialPost?: Post | null;
}

export default function CreatePostSheetUI({
  onSuccess,
  onCancel,
  initialPost,
}: CreatePostSheetUIProps) {
  const handleSuccess = () => {
    openGlobalSheet({ snapPoints: ["1%"], children: <></> });
    onSuccess?.();
  };

  const handleCancel = () => {
    openGlobalSheet({ snapPoints: ["1%"], children: <></> });
    onCancel?.();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
      enabled={true}
    >
      <PostForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialPost={initialPost}
      />
    </KeyboardAvoidingView>
  );
}
