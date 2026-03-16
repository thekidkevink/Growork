import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";
import { supabase } from "./supabase";

export const STORAGE_BUCKETS = {
  POSTS: "posts",
  DOCUMENTS: "documents",
  AVATARS: "avatars",
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const FILE_TYPES = {
  IMAGE: "image",
  DOCUMENT: "document",
  AVATAR: "avatar",
} as const;

export type FileType = (typeof FILE_TYPES)[keyof typeof FILE_TYPES];

export const FILE_LIMITS = {
  [FILE_TYPES.IMAGE]: 10 * 1024 * 1024, // 10MB
  [FILE_TYPES.DOCUMENT]: 50 * 1024 * 1024, // 50MB
  [FILE_TYPES.AVATAR]: 5 * 1024 * 1024, // 5MB
} as const;

// Enhanced file validation with better error handling
const validateFile = async (
  uri: string,
  type: FileType
): Promise<{
  fileInfo: FileSystem.FileInfo;
  fileExt: string;
  fileSize?: number;
}> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      throw new Error("File does not exist");
    }

    // Get file size safely
    let fileSize: number | undefined;
    if ("size" in fileInfo && typeof fileInfo.size === "number") {
      fileSize = fileInfo.size;
    }

    const sizeLimit = FILE_LIMITS[type];
    if (fileSize && fileSize > sizeLimit) {
      throw new Error(`File size exceeds ${sizeLimit / (1024 * 1024)}MB limit`);
    }

    // Get file extension with more robust parsing
    const fileExt = uri.split(".").pop()?.toLowerCase();
    if (!fileExt) {
      throw new Error("Invalid file extension");
    }

    return { fileInfo, fileExt, fileSize };
  } catch (error) {
    console.error("File validation error:", error);
    throw error;
  }
};

const DOCUMENT_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

// Upload function with improved typing
export const uploadImage = async ({
  bucket = STORAGE_BUCKETS.POSTS,
  userId,
  uri,
  fileNamePrefix = "image",
  onProgress,
}: {
  bucket: StorageBucket;
  userId: string;
  uri: string;
  fileNamePrefix?: string;
  onProgress?: (progress: number) => void;
}) => {
  try {
    // Validate file
    const { fileExt } = await validateFile(uri, FILE_TYPES.IMAGE);

    // Generate unique filename with more robust naming
    const fileName = `${fileNamePrefix}_${userId}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Improved base64 conversion
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64" as const,
    });

    const byteArray = Uint8Array.from(Buffer.from(base64, "base64"));

    // Upload to Supabase with better error handling
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, byteArray, {
        contentType: `image/${fileExt}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Return public URL
    const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath)
      .data.publicUrl;

    return publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};

// Similar improvements for uploadDocument and deleteFile
export const uploadDocument = async ({
  bucket = STORAGE_BUCKETS.DOCUMENTS,
  userId,
  uri,
  fileNamePrefix = "document",
  documentType = "other",
  onProgress,
}: {
  bucket: StorageBucket;
  userId: string;
  uri: string;
  fileNamePrefix?: string;
  documentType?: string;
  onProgress?: (progress: number) => void;
}) => {
  try {
    // Validate file
    const { fileExt, fileSize } = await validateFile(uri, FILE_TYPES.DOCUMENT);

    // Generate unique filename with more robust naming
    const fileName = `${fileNamePrefix}_${userId}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Improved base64 conversion
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64" as const,
    });

    const byteArray = Uint8Array.from(Buffer.from(base64, "base64"));

    // Upload to Supabase with better error handling
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, byteArray, {
        contentType:
          DOCUMENT_CONTENT_TYPES[fileExt] || `application/octet-stream`,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Return upload result
    const result = {
      url: supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl,
      path: filePath,
      size: fileSize,
      type: documentType,
      name: fileName,
    };

    return result;
  } catch (error) {
    console.error("Document upload error:", error);
    throw error;
  }
};

export const deleteFile = async (bucket: StorageBucket, filePath: string) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Delete file error:", error);
    throw error;
  }
};
