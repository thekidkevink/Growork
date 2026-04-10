import { useThemeColor, useAuth } from "@/hooks";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { uploadDocument } from "@/utils/uploadUtils";
import { Flash } from "@/components/ui/Flash";

export const CATEGORIES = [
  "CV",
  "Cover Letter",
  "Qualifications",
  "National ID",
  "Driver's Licence",
  "Other",
];

const mapCategoryToDocumentType = (category: string) => {
  switch (category) {
    case "CV":
      return "cv";
    case "Cover Letter":
      return "cover_letter";
    case "Qualifications":
      return "qualification";
    case "National ID":
      return "national_id";
    case "Driver's Licence":
      return "drivers_licence";
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
      const uploadedDocument = await uploadDocument({
        userId: user.id,
        uri: fileUri,
        documentType,
      });

      // Save document record to database
      const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          type: mapCategoryToDocumentType(documentType),
          name: fileName,
          file_url: uploadedDocument.url,
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
        url: uploadedDocument.url,
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
