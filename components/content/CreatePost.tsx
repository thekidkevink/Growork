import React from "react";
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
    <PostForm
      onSuccess={handleSuccess}
      onCancel={handleCancel}
      initialPost={initialPost}
    />
  );
}
