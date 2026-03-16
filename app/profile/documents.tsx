import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";

import { useAuth, useThemeColor, useDocuments } from "@/hooks";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ScreenContainer from "@/components/ScreenContainer";
import DocumentManager from "@/components/content/DocumentManager";
import DocumentCard from "@/components/content/DocumentCard";
import { Document, DocumentType } from "@/types";
import { useFlashToast } from "@/components/ui/Flash";
import { openGlobalSheet } from "@/utils/globalSheet";

const DOCUMENT_CATEGORIES = [
  { id: DocumentType.CV, label: "CV/Resume", icon: "briefcase" },
  { id: DocumentType.CoverLetter, label: "Cover Letter", icon: "mail" },
  { id: DocumentType.Certificate, label: "Certificate(s)", icon: "award" },
  { id: DocumentType.Other, label: "Other", icon: "file" },
];

export default function DocumentsManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useFlashToast();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");

  const [selectedCategory, setSelectedCategory] = useState<
    DocumentType | "all"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { documents, loading, fetchDocuments, deleteDocument } = useDocuments(
    user?.id
  );

  useEffect(() => {
    if (user?.id) {
      fetchDocuments(selectedCategory === "all" ? undefined : selectedCategory);
    }
  }, [user?.id, selectedCategory, fetchDocuments]);

  const filteredDocuments =
    selectedCategory === "all"
      ? documents
      : documents.filter((doc) => doc.type === selectedCategory);

  const handleViewDocument = async (document: Document) => {
    try {
      if (document.file_url) {
        await Linking.openURL(document.file_url);
      } else {
        toast.show({
          type: "info",
          title: "Document Unavailable",
          message: "This document is not available for viewing.",
        });
      }
    } catch (error) {
      toast.show({
        type: "danger",
        title: "Error",
        message: "Failed to open document. Please try again.",
      });
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${document.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDocument(document.id);
              toast.show({
                type: "success",
                title: "Success",
                message: "Document deleted successfully.",
              });
            } catch (error: any) {
              toast.show({
                type: "danger",
                title: "Error",
                message: "Failed to delete document. Please try again.",
              });
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: DocumentType) => {
    const cat = DOCUMENT_CATEGORIES.find((c) => c.id === category);
    return cat?.icon || "file";
  };

  const getCategoryLabel = (category: DocumentType) => {
    const cat = DOCUMENT_CATEGORIES.find((c) => c.id === category);
    return cat?.label || "Other";
  };

  const getCategoryCount = (category: DocumentType) => {
    return documents.filter((doc) => doc.type === category).length;
  };

  return (
    <ScreenContainer>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Documents</ThemedText>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        >
          <Feather
            name={viewMode === "list" ? "grid" : "list"}
            size={20}
            color={textColor}
          />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <ThemedView style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Document Overview</ThemedText>
          <View style={styles.statsGrid}>
            <ThemedView style={[styles.statCard, { borderColor }]}>
              <ThemedText style={styles.statNumber}>
                {documents.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Total Documents
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { borderColor }]}>
              <ThemedText style={styles.statNumber}>
                {documents.filter((doc) => doc.type === DocumentType.CV).length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Resumes
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { borderColor }]}>
              <ThemedText style={styles.statNumber}>
                {
                  documents.filter(
                    (doc) => doc.type === DocumentType.CoverLetter
                  ).length
                }
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Cover Letters
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.statCard, { borderColor }]}>
              <ThemedText style={styles.statNumber}>
                {
                  documents.filter(
                    (doc) => doc.type === DocumentType.Certificate
                  ).length
                }
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: mutedTextColor }]}>
                Certificate(s)
              </ThemedText>
            </ThemedView>
          </View>
        </ThemedView>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === "all" && { backgroundColor: tintColor },
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <ThemedText
              style={[
                styles.categoryChipText,
                selectedCategory === "all" && { color: backgroundColor },
              ]}
            >
              All ({documents.length})
            </ThemedText>
          </TouchableOpacity>

          {DOCUMENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && {
                  backgroundColor: tintColor,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Feather
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.id ? backgroundColor : textColor
                }
              />
              <ThemedText
                style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && {
                    color: backgroundColor,
                  },
                ]}
              >
                {category.label} ({getCategoryCount(category.id)})
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upload Section */}
        <ThemedView style={styles.uploadSection}>
          <ThemedText style={styles.sectionTitle}>
            Upload New Document
          </ThemedText>
          <ThemedText
            style={[styles.sectionSubtitle, { color: mutedTextColor }]}
          >
            Choose a category and upload your document
          </ThemedText>

          <View style={styles.uploadGrid}>
            {DOCUMENT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.uploadCard, { borderColor }]}
                onPress={() => {
                  // Open DocumentManager for specific category
                  openGlobalSheet({
                    dynamicSnapPoint: true,
                    dynamicOptions: {
                      minHeight: 250,
                      maxHeight: 0.85,
                      padding: 50,
                    },
                    children: (
                      <DocumentManager
                        userId={user?.id}
                        documentType={category.id}
                        onSuccess={() =>
                          fetchDocuments(
                            selectedCategory === "all"
                              ? undefined
                              : selectedCategory
                          )
                        }
                        disableScrolling={true}
                      />
                    ),
                  });
                }}
              >
                <Feather
                  name={category.icon as any}
                  size={24}
                  color={tintColor}
                />
                <ThemedText style={styles.uploadCardText}>
                  {category.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>

        {/* Documents List */}
        <ThemedView style={styles.documentsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              {selectedCategory === "all"
                ? "All Documents"
                : getCategoryLabel(selectedCategory)}{" "}
              ({filteredDocuments.length})
            </ThemedText>
            {filteredDocuments.length > 0 && (
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => {
                  openGlobalSheet({
                    snapPoints: ["90%"],
                    children: (
                      <DocumentManager
                        userId={user?.id}
                        documentType={
                          selectedCategory === "all"
                            ? undefined
                            : selectedCategory
                        }
                        onSuccess={() =>
                          fetchDocuments(
                            selectedCategory === "all"
                              ? undefined
                              : selectedCategory
                          )
                        }
                        disableScrolling={true}
                      />
                    ),
                  });
                }}
              >
                <Feather name="plus" size={16} color={textColor} />
                <ThemedText style={styles.uploadButtonText}>Add</ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ThemedView style={styles.loadingContainer}>
              <ThemedText
                style={[styles.loadingText, { color: mutedTextColor }]}
              >
                Loading documents...
              </ThemedText>
            </ThemedView>
          ) : filteredDocuments.length === 0 ? (
            <ThemedView style={styles.emptyContainer}>
              <Feather name="folder" size={48} color={mutedTextColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No documents found
              </ThemedText>
              <ThemedText
                style={[styles.emptySubtitle, { color: mutedTextColor }]}
              >
                {selectedCategory === "all"
                  ? "Upload your first document to get started"
                  : `No ${getCategoryLabel(
                      selectedCategory
                    ).toLowerCase()} documents found`}
              </ThemedText>
            </ThemedView>
          ) : (
            <View style={styles.documentsList}>
              {filteredDocuments.map((document) => (
                <ThemedView
                  key={document.id}
                  style={[styles.documentCard, { borderColor }]}
                >
                  <DocumentCard
                    document={document}
                    onPress={() => handleViewDocument(document)}
                    onDelete={() => handleDeleteDocument(document)}
                    showCategory={true}
                    variant="detailed"
                  />
                </ThemedView>
              ))}
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  viewModeButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  categoryFilter: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryFilterContent: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 6,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  uploadSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  uploadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  uploadCard: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  uploadCardText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  documentsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
});
