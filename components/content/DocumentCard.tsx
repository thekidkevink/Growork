import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Document } from "@/types/documents";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { useThemeColor } from "@/hooks";

interface DocumentCardProps {
  document: Document;
  onPress?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  showMenu?: boolean;
  showCategory?: boolean;
  variant?: "default" | "compact" | "detailed";
  onPressMenu?: () => void;
  selectable?: boolean;
  selected?: boolean;
}

const IconWithBackground = ({
  icon,
  selected,
}: {
  icon: React.ReactNode;
  selected?: boolean;
}) => {
  const iconColor = useThemeColor({}, "iconSecondary");
  const tintColor = useThemeColor({}, "tint");

  return (
    <View
      style={[
        styles.iconContainer,
        { backgroundColor: selected ? tintColor + "15" : "transparent" },
      ]}
    >
      {icon}
    </View>
  );
};

export default function DocumentCard({
  document,
  onPress,
  onDownload,
  onShare,
  onDelete,
  showMenu = true,
  showCategory = false,
  variant = "default",
  onPressMenu,
  selectable = false,
  selected = false,
}: DocumentCardProps) {
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const mutedText = useThemeColor({}, "mutedText");
  const iconColor = useThemeColor({}, "iconSecondary");
  const tintColor = useThemeColor({}, "tint");

  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setMenuVisible(!menuVisible);
    onPressMenu?.();
  };

  const handleDownload = () => {
    onDownload?.();
    setMenuVisible(false);
  };

  const handleShare = () => {
    onShare?.();
    setMenuVisible(false);
  };

  const handleDelete = () => {
    onDelete?.();
    setMenuVisible(false);
  };

  // Format the upload date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const formattedDate = formatDate(document.uploaded_at);

  // Get document type display name
  const getDocumentTypeDisplay = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get file extension from name
  const getFileExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
  };

  const renderMenuButton = () => {
    if (!showMenu) return null;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.menuButton,
          { backgroundColor: pressed ? borderColor + "11" : "transparent" },
        ]}
        onPress={onPressMenu ? onPressMenu : handleMenuPress}
      >
        <Feather name="more-vertical" size={20} color={iconColor} />
      </Pressable>
    );
  };

  const renderCategory = () => {
    if (!showCategory) return null;

    return (
      <View style={styles.categoryContainer}>
        <ThemedText
          style={[
            styles.categoryText,
            { color: mutedText, backgroundColor: borderColor + "18" },
          ]}
        >
          {getDocumentTypeDisplay(document.type)}
        </ThemedText>
      </View>
    );
  };

  const renderMetadata = () => {
    if (variant !== "detailed") return null;

    return (
      <View style={styles.metadataContainer}>
        <View style={styles.metadataRow}>
          <Feather name="calendar" size={12} color={mutedText} />
          <ThemedText style={[styles.metadataText, { color: mutedText }]}>
            {formattedDate}
          </ThemedText>
        </View>
        <View style={styles.metadataRow}>
          <Feather name="file" size={12} color={mutedText} />
          <ThemedText style={[styles.metadataText, { color: mutedText }]}>
            {getFileExtension(document.name || "")}
          </ThemedText>
        </View>
      </View>
    );
  };

  const cardStyle =
    variant === "compact"
      ? styles.cardCompact
      : variant === "detailed"
      ? styles.cardDetailed
      : styles.card;

  return (
    <Pressable
      style={({ pressed }) => [
        cardStyle,
        {
          borderColor,
          backgroundColor: pressed ? borderColor + "10" : "transparent",
        },
      ]}
      onPress={onPress}
    >
      <IconWithBackground
        icon={
          <Feather
            name="file-text"
            size={22}
            color={selected ? tintColor : textColor}
          />
        }
        selected={selected}
      />

      <View style={styles.cardTextWrap}>
        <ThemedText
          style={styles.cardTitle}
          numberOfLines={variant === "detailed" ? 1 : variant === "compact" ? 1 : 2}
        >
          {document.name}
        </ThemedText>

        <View style={styles.metaRow}>
          <ThemedText style={[styles.cardSubtitle, { color: mutedText }]}>
            {formattedDate}
          </ThemedText>
          {variant === "detailed" && (
            <ThemedText style={[styles.fileType, { color: mutedText }]}>
              {getFileExtension(document.name || "")}
            </ThemedText>
          )}
        </View>

        {renderCategory()}
        {renderMetadata()}
      </View>

      {renderMenuButton()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
    gap: 10,
  },
  cardCompact: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderWidth: 1,
    borderRadius: 10,
    gap: 8,
  },
  cardDetailed: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
    gap: 10,
    minHeight: 0,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTextWrap: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: "400",
  },
  fileType: {
    fontSize: 11,
    fontWeight: "500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  categoryContainer: {
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  metadataContainer: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 4,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metadataText: {
    fontSize: 12,
    fontWeight: "400",
  },
  menuButton: {
    padding: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
  },
});
