import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColor, Comment } from "@/hooks";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { ThemedAvatar } from "@/components/ui/ThemedAvatar";
import { ThemedIconButton } from "@/components/ui/ThemedIconButton";

interface CommentItemProps {
  item: Comment;
  isOwn: boolean;
  isAuthor: boolean; // Post creator
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  onMenu: () => void;
  formatDate: (dateString: string) => string;
}

export function CommentItem({
  item,
  isOwn,
  isAuthor,
  liked,
  likeCount,
  onLike,
  onMenu,
  formatDate,
}: CommentItemProps) {
  const mutedTextColor = useThemeColor({}, "mutedText");
  const tintColor = useThemeColor({}, "tint");

  const displayName = item.profile
    ? `${item.profile.name} ${item.profile.surname}`
    : "Anonymous";
  const avatarUrl =
    item.profile?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName
    )}&size=128`;

  return (
    <View style={styles.row}>
      <ThemedAvatar image={avatarUrl} size={34} />
      <View style={styles.content}>
        <View style={styles.headerLine}>
          <View style={styles.leftSection}>
            <ThemedText type="defaultSemiBold" style={styles.name}>
              {displayName}
            </ThemedText>

            <ThemedText style={[styles.time, { color: mutedTextColor }]}>
              {formatDate(item.created_at)}
            </ThemedText>
          </View>

          <View style={styles.leftSection}>
            <ThemedIconButton
              icon={
                <Feather
                  name="heart"
                  size={15}
                  color={liked ? tintColor : mutedTextColor}
                  fill={liked ? tintColor : "none"}
                />
              }
              onPress={onLike}
            />
            {likeCount > 0 && (
              <ThemedText style={[styles.likeCount, { color: mutedTextColor }]}>
                {likeCount}
              </ThemedText>
            )}
          </View>

          {isOwn && (
            <ThemedIconButton
              icon={
                <Feather
                  name="more-horizontal"
                  size={17}
                  color={mutedTextColor}
                />
              }
              onPress={onMenu}
            />
          )}
        </View>
        <ThemedText style={styles.body}>{item.content}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  content: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  headerLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    gap: 6,
    flexWrap: "wrap",
  },
  name: {
    fontSize: 14,
    marginRight: 2,
  },

  time: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 1,
  },
  body: {
    fontSize: 15,
    marginBottom: 3,
    marginRight: 16,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
    marginBottom: 0,
    minHeight: 28,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 2,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
