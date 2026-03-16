import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { openGlobalSheet } from "@/utils/globalSheet";
import PostForm from "./post/PostForm";

interface CreatePostSheetUIProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreatePostSheetUI({
  onSuccess,
  onCancel,
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
      <PostForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </KeyboardAvoidingView>
  );
}
