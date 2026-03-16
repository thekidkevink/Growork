import { useThemeColor, useDocuments, useAuth } from "@/hooks";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import {
  Linking,
  Pressable,
  Share,
  StyleSheet,
  View,
} from "react-native";
import { ThemedText } from "../ThemedText";
import DocumentList from "../content/DocumentList";
import { Document } from "@/types";
import CustomOptionStrip from "../ui/CustomOptionStrip";
import { useBottomSheetManager } from "@/components/content/BottomSheetManager";
import { useFlashToast } from "@/components/ui/Flash";
import ActionPromptModal from "@/components/ui/ActionPromptModal";

const DOCUMENT_FILTERS = [
  { icon: "briefcase", label: "CV" },
  { icon: "mail", label: "Cover Letter" },
  { icon: "award", label: "Certificate(s)" },
  { icon: "file", label: "Other" },
];

const ALL_DOCUMENT_OPTIONS = [
  { icon: "briefcase", label: "CV" },
  { icon: "mail", label: "Cover Letter" },
  { icon: "award", label: "Certificate(s)" },
  { icon: "file", label: "Other" },
];

interface DocumentsListProps {
  selectedDocumentFilter?: string;
  showHeader?: boolean;
  showUploadButton?: boolean;
  onUploadPress?: () => void;
}

function filterDocumentsByCategory(
  documents: Document[],
  categoryFilter: string
) {
  if (!categoryFilter || categoryFilter === "All") return documents;

  return documents.filter((doc) => {
    const docCategory = doc.type?.toLowerCase() || "";
    const filterCategory = categoryFilter.toLowerCase();

    // Map filter labels to document categories
    const categoryMapping: Record<string, string[]> = {
      cv: ["cv", "resume"],
      "cover letter": ["cover_letter", "coverletter"],
      "certificate(s)": ["certificate", "cert", "diploma", "achievement"],
      other: ["other", "other_document"],
    };

    const mappedCategories = categoryMapping[filterCategory] || [
      filterCategory,
    ];
    return mappedCategories.some((cat) => docCategory.includes(cat));
  });
}

function DocumentsListInner({
  selectedDocumentFilter = "All",
  showHeader = true,
  showUploadButton = true,
  onUploadPress,
}: DocumentsListProps) {
  const { user } = useAuth();
  const { documents, loading, fetchDocuments, deleteDocument } = useDocuments(
    user?.id
  );
  const [, setModalVisible] = useState(false);
  const tintColor = useThemeColor({}, "tint");
  const mutedText = useThemeColor({}, "mutedText");
  const textColor = useThemeColor({}, "text");
  const [selectedDocumentFilterIndex, setSelectedDocumentFilterIndex] =
    useState(-1);
  const [pendingDelete, setPendingDelete] = useState<Document | null>(null);
  const [visibleDocumentFilters] = useState(DOCUMENT_FILTERS);
  const { openDocumentsSheet } = useBottomSheetManager();
  const toast = useFlashToast();

  useEffect(() => {
    if (user?.id) {
      fetchDocuments();
    }
  }, [user?.id, fetchDocuments]);

  const openModal = () => {
    if (onUploadPress) {
      onUploadPress();
    } else {
      setModalVisible(true);
      openDocumentsSheet();
    }
  };

  const handleDocumentFilterChange = (index: number) => {
    setSelectedDocumentFilterIndex(index);
  };

  const getSelectedDocumentFilterLabel = () => {
    return selectedDocumentFilterIndex >= 0
      ? DOCUMENT_FILTERS[selectedDocumentFilterIndex]?.label
      : "All";
  };

  // Filter documents by category
  const categoryFilteredDocuments = filterDocumentsByCategory(
    documents,
    getSelectedDocumentFilterLabel()
  );

  const handleDocumentPress = (document: Document) => {
    if (!document.file_url) {
      toast.show({
        type: "info",
        title: "Unavailable",
        message: "This document is not available right now.",
      });
      return;
    }

    Linking.openURL(document.file_url).catch(() => {
      toast.show({
        type: "danger",
        title: "Error",
        message: "Could not open this document.",
      });
    });
  };

  const handleDocumentDownload = (document: Document) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!document.file_url) {
      toast.show({
        type: "info",
        title: "Unavailable",
        message: "This document is not available right now.",
      });
      return;
    }

    Linking.openURL(document.file_url).catch(() => {
      toast.show({
        type: "danger",
        title: "Error",
        message: "Could not open this document.",
      });
    });
  };

  const handleDocumentShare = (document: Document) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!document.file_url) {
      toast.show({
        type: "info",
        title: "Unavailable",
        message: "This document is not available right now.",
      });
      return;
    }

    void Share.share({
      title: document.name || "Document",
      message: document.file_url,
      url: document.file_url,
    }).catch(() => {
      toast.show({
        type: "danger",
        title: "Error",
        message: "Could not share this document.",
      });
    });
  };

  const handleDocumentDelete = (document: Document) => {
    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPendingDelete(document);
  };

  return (
    <>
      <ActionPromptModal
        visible={!!pendingDelete}
        title="Delete document"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.name || "this document"} from your profile?`
            : ""
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (!pendingDelete) return;
          const documentToDelete = pendingDelete;
          setPendingDelete(null);
          const { error } = await deleteDocument(documentToDelete.id);
          if (error) {
            toast.show({
              type: "danger",
              title: "Error",
              message: "Failed to delete document.",
            });
            return;
          }
          toast.show({
            type: "success",
            title: "Deleted",
            message: "Document removed successfully.",
          });
        }}
      />
      {/* Document Heading */}
      {showHeader && (
        <View style={styles.headerRow}>
          <ThemedText style={styles.headerTitle}>Documents</ThemedText>
          {showUploadButton && (
            <Pressable
              onPress={() => {
                if (process.env.EXPO_OS === "ios") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                openModal();
              }}
            >
              <ThemedText style={[styles.uploadText, { color: tintColor }]}>
                Upload
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}

      {/* Document Filter */}
      <View
        style={{ paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 }}
      >
        <CustomOptionStrip
          visibleOptions={visibleDocumentFilters}
          selectedIndex={selectedDocumentFilterIndex}
          onChange={handleDocumentFilterChange}
          allOptions={ALL_DOCUMENT_OPTIONS}
          minVisibleOptions={2}
          maxVisibleOptions={6}
        />
      </View>

      {/* Documents List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.loadingText, { color: mutedText }]}>
            Loading documents...
          </ThemedText>
        </View>
      ) : categoryFilteredDocuments.length === 0 ? (
        showUploadButton ? (
          <Pressable
            style={({ pressed }) => [
              styles.emptyState,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              if (process.env.EXPO_OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              openModal();
            }}
          >
            <Feather name="folder" size={48} color={mutedText} />
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              No Documents Yet
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: mutedText }]}>
              Tap to upload your CV, cover letter, certificate(s), and other documents
            </ThemedText>
          </Pressable>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="folder" size={48} color={mutedText} />
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              No Documents Yet
            </ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: mutedText }]}>
              No documents found
            </ThemedText>
          </View>
        )
      ) : (
        <DocumentList
          documents={categoryFilteredDocuments}
          groupedByCategory={true}
          onDocumentPress={handleDocumentPress}
          onDocumentDownload={handleDocumentDownload}
          onDocumentShare={handleDocumentShare}
          onDocumentDelete={handleDocumentDelete}
          emptyText={`No ${getSelectedDocumentFilterLabel().toLowerCase()} documents found`}
        />
      )}
    </>
  );
}

export default function DocumentsList(props: DocumentsListProps) {
  return <DocumentsListInner {...props} />;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
    paddingTop: 8,
  },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countText: {
    fontSize: 15,
    marginRight: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  uploadText: {
    fontWeight: "500",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    width: "100%",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 0,
    borderWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 12,
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  cardTextWrap: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
  },
  iconButton: {
    padding: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  statLabel: {
    fontSize: 12,
  },
});
