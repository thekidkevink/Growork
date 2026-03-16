import { useAuth, useThemeColor } from "@/hooks";
import { DocumentType, Document } from "@/types";
import { supabase } from "@/utils/supabase";
import { STORAGE_BUCKETS } from "@/utils/uploadUtils";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import BadgeSelector, { BadgeOption } from "../ui/BadgeSelector";
import DocumentCard from "./DocumentCard";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system/legacy";
import { Buffer } from "buffer";

type DocumentManagerProps = {
  userId?: string;
  documentType?: DocumentType;
  onSuccess?: () => void;
  selectable?: boolean;
  onSelect?: (document: Document) => void;
  disableScrolling?: boolean;
};

const DOCUMENT_TYPE_OPTIONS: BadgeOption[] = [
  { label: "CV/Resume", value: DocumentType.CV },
  { label: "Cover Letter", value: DocumentType.CoverLetter },
  { label: "Certificate", value: DocumentType.Certificate },
  { label: "Other", value: DocumentType.Other },
];

export default function DocumentManager({
  userId,
  documentType,
  onSuccess,
  selectable = false,
  onSelect,
  disableScrolling = false,
}: DocumentManagerProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<DocumentType>(documentType || DocumentType.CV);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");

  // Fetch documents function
  const fetchDocuments = useCallback(async () => {
    if (!userId || !documentType) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", userId)
        .eq("is_application_snapshot", false)
        .eq("type", documentType)
        .order("uploaded_at", { ascending: false });

      if (error) {
        console.error("Error fetching documents:", error);
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, documentType]);

  // Fetch documents when component mounts or documentType changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDocumentSelect = (document: Document) => {
    if (selectable && onSelect) {
      setSelectedDocumentId(document.id);
      onSelect(document);
    }
  };

  const handleUploadDocument = async () => {
    if (!user) return;

    try {
      setUploading(true);

      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setUploading(false);
        return;
      }

      const file = result.assets[0];

      // Validate file exists
      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      if (!fileInfo.exists) {
        throw new Error("Document file does not exist");
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (fileInfo.size && fileInfo.size > maxSize) {
        throw new Error("Document file is too large (max 50MB)");
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const uniqueFileName = `document_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${uniqueFileName}`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: "base64" as const,
      });

      const byteArray = Uint8Array.from(Buffer.from(base64, "base64"));

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .upload(filePath, byteArray, {
          contentType:
            fileExt === "pdf"
              ? "application/pdf"
              : fileExt === "doc"
                ? "application/msword"
                : fileExt === "docx"
                  ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  : "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const publicUrl = supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .getPublicUrl(filePath).data.publicUrl;

      // Add document record
      const { data: insertedDocument, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          type: selectedDocumentType,
          name: file.name,
          file_url: publicUrl,
        })
        .select("*")
        .single();

      if (dbError) {
        throw dbError;
      }

      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert("Success", "Document uploaded successfully!");

      // Refresh the documents list
      await fetchDocuments();
      if (selectable && insertedDocument && onSelect) {
        setSelectedDocumentId(insertedDocument.id);
        onSelect(insertedDocument);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      Alert.alert("Upload Error", error.message || "Failed to upload document");
      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {selectable ? (
        // Selection mode
        <>
          {loading ? (
            <View
              style={[
                styles.loadingContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <ActivityIndicator size="large" color={textColor} />
              <ThemedText style={[styles.loadingText, { color: textColor }]}>
                Loading documents...
              </ThemedText>
            </View>
          ) : documents.length === 0 ? (
            <View
              style={[
                styles.emptyContainer,
                { backgroundColor: "transparent" },
              ]}
            >
              <Pressable
                style={[
                  styles.uploadButton,
                  { borderColor: tintColor },
                  uploading && styles.uploadButtonDisabled,
                ]}
                onPress={handleUploadDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={textColor} />
                ) : (
                  <>
                    <Feather name="upload" size={20} color={textColor} />
                    <ThemedText style={styles.uploadButtonText}>
                      Upload
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <ScrollView
              style={[styles.documentsList, { backgroundColor: "transparent" }]}
              showsVerticalScrollIndicator={!disableScrolling}
              scrollEnabled={!disableScrolling}
            >
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onPress={() => handleDocumentSelect(document)}
                  showMenu={false}
                  selectable={true}
                  selected={selectedDocumentId === document.id}
                />
              ))}
            </ScrollView>
          )}
        </>
      ) : (
        // Upload mode
        <>
          <View style={styles.header}>
            <ThemedText style={styles.title} type="defaultSemiBold">
              Upload Document
            </ThemedText>
          </View>

          {/* Document Type Selector */}
          {!documentType && (
            <View style={styles.selectorContainer}>
              <BadgeSelector
                options={DOCUMENT_TYPE_OPTIONS}
                selectedValue={selectedDocumentType}
                onValueChange={(value) =>
                  setSelectedDocumentType(value as DocumentType)
                }
                title="Select Document Type"
              />
            </View>
          )}

          {/* Upload Button */}
          <View style={styles.uploadContainer}>
            <Pressable
              style={[
                styles.uploadButton,
                { borderColor: tintColor },
                uploading && styles.uploadButtonDisabled,
              ]}
              onPress={handleUploadDocument}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={textColor} />
              ) : (
                <>
                  <Feather name="upload" size={20} color={textColor} />
                  <ThemedText style={styles.uploadButtonText}>
                    Upload
                  </ThemedText>
                </>
              )}
            </Pressable>
            {uploading && (
              <ThemedText style={[styles.uploadingText, { color: textColor }]}>
                Uploading document...
              </ThemedText>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  selectorContainer: {
    marginBottom: 12,
  },
  uploadContainer: {
    alignItems: "center",
    gap: 12,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    width: "100%",
    justifyContent: "center",
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  uploadingText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
    opacity: 0.7,
  },
  documentsList: {
    flex: 1,
  },
});
