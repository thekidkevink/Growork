import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Platform,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
  Modal,
  Animated,
} from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { Feather } from "@expo/vector-icons";

import { useAuth, useComments, usePosts, useThemeColor } from "@/hooks";
import { useAppContext } from "@/utils/AppContext";
import { useCustomCommentsBottomSheet } from "@/hooks/ui/useBottomSheet";

import { ThemedText } from "../../ThemedText";
import { CommentItem } from "./CommentItem";
import { EmojiBar } from "./EmojiBar";
import { CommentsInputBar } from "./CommentsInputBar";

import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Animation,
  Typography,
} from "@/constants/DesignSystem";

type LikeMap = Record<string, boolean>;
type CountMap = Record<string, number>;

interface CommentsBottomSheetProps {
  postId: string;
  postOwnerId?: string;
  visible: boolean;
  onClose?: () => void;
}

// Context wrapper
export function CommentsBottomSheetWithContext() {
  const { isVisible, currentPostId, currentPostOwnerId, closeCommentsSheet } =
    useCustomCommentsBottomSheet();

  if (!isVisible || !currentPostId) return null;

  return (
    <CommentsBottomSheet
      postId={currentPostId}
      postOwnerId={currentPostOwnerId || undefined}
      visible={isVisible}
      onClose={closeCommentsSheet}
    />
  );
}

export default function CommentsBottomSheet({
  postId,
  postOwnerId,
  visible,
  onClose,
}: CommentsBottomSheetProps) {
  const { profile } = useAuth();
  const { comments, loading, error, fetchComments, addComment, deleteComment } =
    useComments(postId);
  const { posts } = usePosts();
  const {
    toggleCommentLike: toggleLike,
    isCommentLiked: isLiked,
    getCommentLikeCount: getLikeCount,
  } = useAppContext();

  const { showActionSheetWithOptions } = useActionSheet();

  // UI state
  const [commentText, setCommentText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [likedComments, setLikedComments] = useState<LikeMap>({});
  const [likeCounts, setLikeCounts] = useState<CountMap>({});
  const [postCreatorId, setPostCreatorId] = useState<string | null>(null);

  const inputRef = useRef<any>(null);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Theme
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "border");
  const mutedText = useThemeColor({}, "mutedText");
  const backgroundSecondary = useThemeColor({}, "backgroundSecondary");

  // Lifecycle guards
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Animate open/close
  useEffect(() => {
    const open = Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }),
    ]);

    const close = Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: Animation.duration.normal,
        useNativeDriver: true,
      }),
    ]);

    (visible ? open : close).start();
  }, [visible, slideAnim, backdropOpacity]);

  // Load comments + post metadata when visible
  useEffect(() => {
    if (!postId || !visible) return;

    (async () => {
      await fetchComments(postId);
      if (!mounted.current) return;
      setCommentText("");

      const post = posts.find((p) => p.id === postId);
      if (mounted.current) setPostCreatorId(post ? post.user_id : null);
    })();
  }, [postId, visible, posts, fetchComments]);

  // Load like states/counts
  useEffect(() => {
    if (!comments?.length) return;

    let cancelled = false;
    (async () => {
      const valid = comments.filter((c) => c && typeof c.id === "string");
      const likeStates: LikeMap = {};
      const counts: CountMap = {};

      for (const c of valid) {
        try {
          const [liked, count] = await Promise.all([
            isLiked(c.id),
            getLikeCount(c.id),
          ]);
          if (cancelled) return;
          likeStates[c.id] = !!liked;
          counts[c.id] = count ?? 0;
        } catch {
          if (cancelled) return;
          likeStates[c.id] = false;
          counts[c.id] = 0;
        }
      }
      if (!cancelled && mounted.current) {
        setLikedComments(likeStates);
        setLikeCounts(counts);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [comments, isLiked, getLikeCount]);

  // Handlers
  const handleSubmitComment = useCallback(async () => {
    if (!profile || !commentText.trim() || isSending) return;
    setIsSending(true);
    try {
      await addComment(commentText);
      if (mounted.current) setCommentText("");
    } finally {
      if (mounted.current) setIsSending(false);
    }
  }, [profile, commentText, isSending, addComment]);

  const handleToggleLike = useCallback(
    async (commentId: string) => {
      const prevLiked = !!likedComments[commentId];
      const prevCount = likeCounts[commentId] ?? 0;

      setLikedComments((prev) => ({ ...prev, [commentId]: !prevLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [commentId]: prevCount + (prevLiked ? -1 : 1),
      }));

      const result = await toggleLike(commentId);
      if (!result?.success && mounted.current) {
        setLikedComments((prev) => ({ ...prev, [commentId]: prevLiked }));
        setLikeCounts((prev) => ({ ...prev, [commentId]: prevCount }));
      }
    },
    [likedComments, likeCounts, toggleLike]
  );

  const handleMenu = useCallback(
    (commentId: string) => {
      const options = ["Delete", "Cancel"];
      showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: "Comment Options",
          message: "Delete this comment?",
        },
        (selectedIndex?: number) => {
          if (selectedIndex === 0) {
            deleteComment(commentId);
          }
        }
      );
    },
    [showActionSheetWithOptions, deleteComment]
  );

  const handleBackdropPress = useCallback(() => {
    Keyboard.dismiss();
    onClose?.();
  }, [onClose]);

  const handleClosePress = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Animations
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  // KeyboardAvoidingView tuning
  const kavBehavior = Platform.OS === "ios" ? "padding" : "height";
  const kavOffset = Platform.OS === "ios" ? 80 : 80;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose || (() => {})}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
              backgroundColor:
                textColor === Colors.light.text
                  ? Colors.light.shadow
                  : Colors.dark.shadow,
            },
          ]}
        >
          <Pressable
            style={styles.backdropPressable}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: backgroundSecondary,
              transform: [{ translateY }],
              shadowColor:
                textColor === Colors.light.text
                  ? Colors.light.shadow
                  : Colors.dark.shadow,
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={[styles.handleBar, { backgroundColor: borderColor }]} />

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View style={styles.headerContent}>
              <ThemedText style={styles.headerTitle}>Comments</ThemedText>
              <ThemedText style={[styles.commentCount, { color: mutedText }]}>
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </ThemedText>
            </View>
            <Pressable
              onPress={handleClosePress}
              style={styles.closeButton}
              accessibilityLabel="Close comments"
            >
              <Feather name="x" size={24} color={textColor} />
            </Pressable>
          </View>

          {/* Keyboard-aware column: Scroll + Input */}
          <KeyboardAvoidingView
            style={styles.kav}
            behavior={kavBehavior}
            keyboardVerticalOffset={kavOffset}
          >
            <ScrollView
              style={styles.commentList}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              contentInsetAdjustmentBehavior="always"
              showsVerticalScrollIndicator={false}
            >
              {comments.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Feather
                    name="message-circle"
                    size={48}
                    color={mutedText}
                    style={styles.emptyIcon}
                  />
                  <ThemedText style={[styles.emptyText, { color: mutedText }]}>
                    No comments yet
                  </ThemedText>
                  <ThemedText
                    style={[styles.emptySubtext, { color: mutedText }]}
                  >
                    Be the first to share your thoughts!
                  </ThemedText>
                </View>
              )}

              {comments
                .filter((item) => item && typeof item.id === "string")
                .map((item) => (
                  <CommentItem
                    key={item.id}
                    item={item}
                    isOwn={!!profile && item.user_id === profile.id}
                    isAuthor={!!postCreatorId && item.user_id === postCreatorId}
                    liked={!!likedComments[item.id]}
                    likeCount={likeCounts[item.id] ?? 0}
                    onLike={() => handleToggleLike(item.id)}
                    onMenu={() => handleMenu(item.id)}
                    formatDate={(dateString) => {
                      const date = new Date(dateString);
                      const now = new Date();
                      const diffInHours =
                        (now.getTime() - date.getTime()) / (1000 * 60 * 60);
                      if (diffInHours < 1) return "Just now";
                      if (diffInHours < 24)
                        return `${Math.floor(diffInHours)}h ago`;
                      return date.toLocaleDateString();
                    }}
                  />
                ))}
            </ScrollView>

            {/* Input Section */}
            <View
              style={[
                styles.inputSection,
                {
                  borderTopColor: borderColor,
                  backgroundColor: backgroundSecondary,
                },
              ]}
            >
              <EmojiBar
                emojis={["❤️", "👏", "🔥", "🙏", "😢", "😊", "😮", "😂"]}
                onEmoji={(e) => setCommentText((p) => p + e)}
              />
              <CommentsInputBar
                profile={profile}
                value={commentText}
                onChange={setCommentText}
                onSend={handleSubmitComment}
                isSending={isSending}
                inputRef={inputRef}
                onEmojiPicker={() => inputRef.current?.focus()}
              />
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorContainer}>
                <ThemedText
                  style={[
                    styles.errorText,
                    {
                      color:
                        textColor === Colors.light.text
                          ? Colors.light.mutedText
                          : Colors.dark.mutedText,
                    },
                  ]}
                >
                  {error}
                </ThemedText>
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    height: "90%",
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  commentCount: {
    fontSize: Typography.sm,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  kav: {
    flex: 1, // critical for proper resizing with the keyboard
  },
  commentList: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.lg,
    fontWeight: Typography.medium,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.sm,
    textAlign: "center",
  },
  inputSection: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm, // minimal, let KAV manage bottom space
    paddingHorizontal: Spacing.sm,
  },
  errorContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.sm,
    textAlign: "center",
  },
});
