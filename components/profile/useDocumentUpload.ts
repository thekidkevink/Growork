import { useThemeColor, useAuth } from "@/hooks";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import { Buffer } from "buffer";
import { supabase } from "@/utils/supabase";
import { STORAGE_BUCKETS } from "@/utils/uploadUtils";
import { Flash } from "@/components/ui/Flash";

export const CATEGORIES = ["CV", "Cover Letter", "Certificate(s)", "Other"];

const mapCategoryToDocumentType = (category: string) => {
  switch (category) {
    case "CV":
      return "cv";
    case "Cover Letter":
      return "cover_letter";
    case "Certificate(s)":
      return "certificate";
    case "Other":
      return "other";
    default:
      return category.toLowerCase().replace(/\s+/g, "_");
  }
};

export function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const borderColor = useThemeColor({}, "border");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const textColor = useThemeColor({}, "text");
  const { dismiss } = useBottomSheetModal();
  const { user } = useAuth();

  // Upload document to Supabase
  const uploadDocumentToSupabase = async (
    fileUri: string,
    fileName: string,
    documentType: string
  ) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      // Validate file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("Document file does not exist");
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (fileInfo.size && fileInfo.size > maxSize) {
        throw new Error("Document file is too large (max 50MB)");
      }

      // Get file extension
      const fileExt = fileName.split(".").pop()?.toLowerCase() || "pdf";
      const uniqueFileName = `document_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${uniqueFileName}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: "base64" as const,
      });

      const byteArray = Uint8Array.from(Buffer.from(base64, "base64"));

      // Upload to Supabase storage using Uint8Array instead of Blob
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .upload(filePath, byteArray, {
          contentType:
            fileExt === "pdf"
              ? "application/pdf"
              : "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Document upload error:", error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const publicUrl = supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .getPublicUrl(filePath).data.publicUrl;

      // Save document record to database
      const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          type: mapCategoryToDocumentType(documentType),
          name: fileName,
          file_url: publicUrl,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error(`Failed to save document: ${dbError.message}`);
      }

      return {
        id: docData.id,
        name: fileName,
        url: publicUrl,
        type: documentType,
        uploaded_at: docData.uploaded_at,
      };
    } catch (error: any) {
      console.error("Document upload error:", error);
      throw error;
    }
  };

  // Handler for picking a document file
  const handlePickDocument = async (
    note: string,
    setNote: (v: string) => void
  ) => {
    if (!user?.id) {
      Flash.show({
        type: "danger",
        message: "Error",
        description: "Please log in to upload documents",
      });
      return;
    }

    try {
      setUploading(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (asset.mimeType === "application/pdf") {
          // Upload to Supabase
          const uploadedDoc = await uploadDocumentToSupabase(
            asset.uri,
            asset.name,
            selectedCategory
          );

          // Update local state
          setDocuments((prev) => [
            {
              id: uploadedDoc.id,
              name: uploadedDoc.name,
              updated: "Just now",
              category: selectedCategory,
              note: note.trim(),
              url: uploadedDoc.url,
            },
            ...prev,
          ]);

          setNote("");
          dismiss();
          Flash.show({
            type: "success",
            message: "Success",
            description: "Document uploaded successfully!",
          });
        } else {
          Flash.show({
            type: "danger",
            message: "Error",
            description: "Please select a PDF file.",
          });
        }
      }
    } catch (error: any) {
      console.error("Document pick error:", error);
      Flash.show({
        type: "danger",
        message: "Upload Error",
        description: error.message || "Failed to upload document",
      });
    } finally {
      setUploading(false);
    }
  };

  // Load user's documents from database
  const loadUserDocuments = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_application_snapshot", false)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error loading documents:", error);
        return;
      }

      const formattedDocs = data.map((doc) => ({
        id: doc.id,
        name: doc.name,
        updated: new Date(doc.uploaded_at).toLocaleDateString(),
        category: doc.type.replace("_", " ").toUpperCase(),
        note: "",
        url: doc.file_url,
      }));

      setDocuments(formattedDocs);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  return {
    documents,
    setDocuments,
    selectedCategory,
    setSelectedCategory,
    handlePickDocument,
    loadUserDocuments,
    uploading,
    borderColor,
    backgroundColor,
    tintColor,
    textColor,
    dismiss,
    CATEGORIES,
  };
}
