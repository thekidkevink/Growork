import { useThemeColor } from "@/hooks";
import { Document } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import DocumentCard from "./DocumentCard";

export interface DocumentListItem {
  document: Document;
}

export interface DocumentListProps {
  documents: Document[];
  title?: string;
  subtitle?: string;
  emptyText?: string;
  showCategory?: boolean;
  variant?: "default" | "compact" | "detailed";
  onDocumentPress?: (document: Document) => void;
  onDocumentDownload?: (document: Document) => void;
  onDocumentShare?: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  showMenu?: boolean;
  groupedByCategory?: boolean;
  categoryTitle?: string;
}

export default function DocumentList({
  documents,
  title,
  subtitle,
  emptyText = "No documents found",
  showCategory = false,
  variant = "default",
  onDocumentPress,
  onDocumentDownload,
  onDocumentShare,
  onDocumentDelete,
  showMenu = true,
  groupedByCategory = false,
  categoryTitle,
}: DocumentListProps) {
  const textColor = useThemeColor({}, "text");
  const mutedText = useThemeColor({}, "mutedText");

  const renderDocumentCard = (document: Document, index: number) => (
    <DocumentCard
      key={`${document.name || document.id}-${index}`}
      document={document}
      variant={variant}
      showMenu={showMenu}
      showCategory={showCategory}
      onPress={() => onDocumentPress?.(document)}
      onDownload={() => onDocumentDownload?.(document)}
      onShare={() => onDocumentShare?.(document)}
      onDelete={() => onDocumentDelete?.(document)}
    />
  );

  const renderGroupedDocuments = () => {
    if (!groupedByCategory) return null;

    const grouped = documents.reduce((acc, doc) => {
      const category = doc.type || "Other";
      // Map document types to display names
      const categoryDisplayName = category
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      if (!acc[categoryDisplayName]) {
        acc[categoryDisplayName] = [];
      }
      acc[categoryDisplayName].push(doc);
      return acc;
    }, {} as Record<string, Document[]>);

    return Object.entries(grouped).map(([category, docs]) => (
      <View key={category} style={styles.categoryGroup}>
        <View style={styles.categoryHeader}>
          <ThemedText style={[styles.categoryTitle, { color: textColor }]}>
            {category}
          </ThemedText>
          <ThemedText style={[styles.categoryCount, { color: mutedText }]}>
            {docs.length} document{docs.length !== 1 ? "s" : ""}
          </ThemedText>
        </View>
        <ThemedView style={styles.documentGroup}>
          {docs.map((doc, index) => renderDocumentCard(doc, index))}
        </ThemedView>
      </View>
    ));
  };

  const renderSimpleDocuments = () => {
    if (groupedByCategory) return null;

    return (
      <ThemedView style={styles.documentList}>
        {documents.map((doc, index) => renderDocumentCard(doc, index))}
      </ThemedView>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={[styles.emptyText, { color: mutedText }]}>
        {emptyText}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <ThemedText style={[styles.title, { color: textColor }]}>
              {title}
            </ThemedText>
          )}
          {subtitle && (
            <ThemedText style={[styles.subtitle, { color: mutedText }]}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      )}

      {/* Content */}
      {documents.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {groupedByCategory
            ? renderGroupedDocuments()
            : renderSimpleDocuments()}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  documentList: {
    width: "100%",
  },
  categoryGroup: {
    marginBottom: 24,
  },
  categoryHeader: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 14,
  },
  documentGroup: {
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
