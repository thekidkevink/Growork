import { useAuth, useThemeColor } from "@/hooks";
import { DocumentType, Document } from "@/types";
import { supabase } from "@/utils/supabase";
import { uploadDocument } from "@/utils/uploadUtils";
import { closeGlobalSheet } from "@/utils/globalSheet";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ActivityIndicator,
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
  { label: "Qualifications", value: DocumentType.Qualification },
  { label: "National ID", value: DocumentType.NationalId },
  { label: "Driver's Licence", value: DocumentType.DriversLicence },
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
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(
    null
  );
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(
    null
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const uploadAbortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);
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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      uploadAbortControllerRef.current?.abort();
      uploadAbortControllerRef.current = null;
    };
  }, []);

  const handleDocumentSelect = (document: Document) => {
    if (selectable && onSelect) {
      setSelectedDocumentId(document.id);
      onSelect(document);
    }
  };

  const handleClose = () => {
    if (uploading) {
      uploadAbortControllerRef.current?.abort();
      uploadAbortControllerRef.current = null;
    }
    closeGlobalSheet();
  };

  const handleUploadDocument = async () => {
    if (!user || uploading || uploadSuccessMessage) return;

    try {
      setUploading(true);
      setUploadSuccessMessage(null);
      setUploadErrorMessage(null);

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
      const abortController = new AbortController();
      uploadAbortControllerRef.current = abortController;

      const uploadedDocument = await uploadDocument({
        userId: user.id,
        uri: file.uri,
        documentType: selectedDocumentType,
        signal: abortController.signal,
      });

      // Add document record
      const { data: insertedDocument, error: dbError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          type: selectedDocumentType,
          name: file.name,
          file_url: uploadedDocument.url,
        })
        .select("*")
        .single();

      if (dbError) {
        throw dbError;
      }

      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Refresh the documents list
      await fetchDocuments();
      onSuccess?.();
      if (selectable && insertedDocument && onSelect) {
        setSelectedDocumentId(insertedDocument.id);
        onSelect(insertedDocument);
      }
      setUploadSuccessMessage(
        `"${insertedDocument?.name || file.name}" uploaded successfully.`
      );
    } catch (error: any) {
      if (!isMountedRef.current) {
        return;
      }

      if (
        error?.name === "AbortError" ||
        error?.message?.includes("Aborted") ||
        error?.message?.includes("aborted")
      ) {
        setUploadErrorMessage(null);
        return;
      }

      console.error("Error uploading document:", error);
      const message =
        error?.message?.includes("Network request failed")
          ? "Upload failed while sending the file. Please check your connection and try again."
          : error.message || "Failed to upload document";
      setUploadErrorMessage(message);
      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      uploadAbortControllerRef.current = null;
      if (isMountedRef.current) {
        setUploading(false);
      }
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
            <Pressable
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={8}
            >
              <Feather name="x" size={20} color={textColor} />
            </Pressable>
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
            {uploadSuccessMessage ? (
              <View style={[styles.feedbackCard, styles.successCard]}>
                <Feather name="check-circle" size={18} color="#15803d" />
                <ThemedText style={styles.successText}>
                  {uploadSuccessMessage}
                </ThemedText>
              </View>
            ) : null}
            {uploadErrorMessage ? (
              <View style={[styles.feedbackCard, styles.errorCard]}>
                <Feather name="alert-circle" size={18} color="#b91c1c" />
                <ThemedText style={styles.errorText}>
                  {uploadErrorMessage}
                </ThemedText>
              </View>
            ) : null}
            <Pressable
              style={[
                styles.uploadButton,
                { borderColor: tintColor },
                (uploading || !!uploadSuccessMessage) &&
                  styles.uploadButtonDisabled,
              ]}
              onPress={handleUploadDocument}
              disabled={uploading || !!uploadSuccessMessage}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={textColor} />
              ) : uploadSuccessMessage ? (
                <>
                  <Feather name="check" size={20} color={textColor} />
                  <ThemedText style={styles.uploadButtonText}>
                    Uploaded
                  </ThemedText>
                </>
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
                Uploading document. Tap X or outside the form to cancel.
              </ThemedText>
            )}
            {uploadSuccessMessage && (
              <ThemedText style={[styles.uploadingText, { color: textColor }]}>
                Tap outside the form to close.
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorContainer: {
    marginBottom: 12,
  },
  uploadContainer: {
    alignItems: "center",
    gap: 12,
  },
  feedbackCard: {
    width: "100%",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successCard: {
    backgroundColor: "#dcfce7",
  },
  errorCard: {
    backgroundColor: "#fee2e2",
  },
  successText: {
    flex: 1,
    color: "#166534",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    flex: 1,
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "500",
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
