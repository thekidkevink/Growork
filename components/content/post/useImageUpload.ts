import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  uploadImage as uploadImageUtil,
  STORAGE_BUCKETS,
} from "@/utils/uploadUtils";
import { useAuth } from "@/hooks";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const pickImage = async (): Promise<string | null> => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return await uploadPostImage(asset.uri);
    }
    return null;
  };

  const uploadPostImage = async (uri: string): Promise<string | null> => {
    if (!user) {
      setError("User not authenticated");
      return null;
    }

    setUploading(true);
    setError(null);

    try {
      // Use the same uploadImage utility as profile
      const publicUrl: string | null = await uploadImageUtil({
        bucket: STORAGE_BUCKETS.POSTS,
        userId: user.id,
        uri,
        fileNamePrefix: "post",
      });

      if (!publicUrl) {
        throw new Error("Failed to upload image");
      }

      return publicUrl;
    } catch (e: any) {
      setError(e.message || "Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    pickImage,
    uploadImage: uploadPostImage,
    uploading,
    error,
    setError,
  };
};
