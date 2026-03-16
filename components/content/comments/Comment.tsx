import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Platform,
  StyleSheet,
  Keyboard,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useAppContext } from "@/utils/AppContext";
import { ThemedText } from "../../ThemedText";
import { CommentItem } from "./CommentItem";
import { EmojiBar } from "./EmojiBar";
import { CommentsInputBar } from "./CommentsInputBar";
import { useAuth, useComments } from "@/hooks";
import type { Comment as CommentType } from "@/hooks/posts/useComments";

type LikeMap = Record<string, boolean>;
type CountMap = Record<string, number>;

interface CommentsProps {
  postId: string;
  disableScrolling?: boolean;
}

export default function Comments({
  postId,
  disableScrolling = false,
}: CommentsProps) {
  const { profile } = useAuth();
  const { comments, loading, error, addComment, deleteComment } =
    useComments(postId);
  const {
    toggleCommentLike: toggleLike,
    isCommentLiked: isLiked,
    getCommentLikeCount: getLikeCount,
  } = useAppContext();

  const { showActionSheetWithOptions } = useActionSheet();

  const [commentText, setCommentText] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [likedComments, setLikedComments] = useState<LikeMap>({});
  const [likeCounts, setLikeCounts] = useState<CountMap>({});
  const inputRef = useRef<any>(null);

  // Only needed if you want to style the bar higher with the keyboard
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (postId) {
      setCommentText("");
    }
  }, [postId]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  useEffect(() => {
    const loadLikeData = async () => {
      if (comments.length > 0) {
        // Filter out any invalid comments first
        const validComments = comments.filter(
          (comment) => comment && comment.id && typeof comment.id === "string"
        );

        if (validComments.length !== comments.length) {
          console.warn(
            `Filtered out ${
              comments.length - validComments.length
            } invalid comments`
          );
        }

        const likeStates: LikeMap = {};
        const counts: CountMap = {};

        for (const comment of validComments) {
          try {
            const [liked, count] = await Promise.all([
              isLiked(comment.id),
              getLikeCount(comment.id),
            ]);
            likeStates[comment.id] = liked;
            counts[comment.id] = count;
          } catch (error) {
            console.error(
              `Error loading like data for comment ${comment.id}:`,
              error
            );
            // Set default values on error
            likeStates[comment.id] = false;
            counts[comment.id] = 0;
          }
        }
        setLikedComments(likeStates);
        setLikeCounts(counts);
      }
    };
    loadLikeData();
  }, [comments, isLiked, getLikeCount]);

  const handleSubmitComment = async () => {
    if (!profile || !commentText.trim()) return;
    setIsSending(true);
    await addComment(commentText);
    setCommentText("");
    setIsSending(false);
  };

  const handleToggleLike = async (commentId: string) => {
    const prevLiked = likedComments[commentId];
    setLikedComments((prev) => ({ ...prev, [commentId]: !prevLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [commentId]: prev[commentId] + (prevLiked ? -1 : 1),
    }));
    const result = await toggleLike(commentId);
    if (!result.success) {
      setLikedComments((prev) => ({ ...prev, [commentId]: prevLiked }));
      setLikeCounts((prev) => ({
        ...prev,
        [commentId]: prev[commentId] + (prevLiked ? 1 : -1),
      }));
    }
  };

  const handleMenu = (commentId: string) => {
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
  };

  const emojiReactions = ["❤️", "👏", "🔥", "🙏", "😢", "😊", "😮", "😂"];

  // Simple date formatting function
  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.commentList}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.skeletonContainer}>
            {[1, 2].map((index) => (
              <View
                key={`comment-skeleton-${index}`}
                style={styles.skeletonItem}
              >
                <View style={styles.skeletonHeader}>
                  <Skeleton
                    width={32}
                    height={32}
                    borderRadius={16}
                    style={styles.skeletonAvatar}
                  />
                  <View style={styles.skeletonText}>
                    <Skeleton
                      width={80}
                      height={12}
                      borderRadius={4}
                      style={styles.skeletonName}
                    />
                    <Skeleton width={60} height={10} borderRadius={4} />
                  </View>
                </View>
                <View style={styles.skeletonContent}>
                  <Skeleton
                    width="90%"
                    height={12}
                    borderRadius={4}
                    style={styles.skeletonLine}
                  />
                  <Skeleton width="70%" height={12} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        )}
        {!loading && comments.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No comments yet. Be the first!
            </ThemedText>
          </View>
        )}
        {comments &&
          comments.length > 0 &&
          comments
            .filter((item) => item && item.id && typeof item.id === "string")
            .map((item: CommentType) => (
              <CommentItem
                key={item.id}
                item={item}
                isOwn={profile ? item.user_id === profile.id : false}
                isAuthor={item.user_id === profile?.id}
                liked={likedComments[item.id] || false}
                likeCount={likeCounts[item.id] || 0}
                onLike={() => handleToggleLike(item.id)}
                onMenu={() => handleMenu(item.id)}
                formatDate={formatCommentDate}
              />
            ))}
      </ScrollView>
      {/* Fixed bottom input bar */}
      <View style={styles.fixedInputContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View
            style={[
              styles.inputSection,
              keyboardVisible && styles.inputSectionKeyboard,
            ]}
          >
            <EmojiBar
              emojis={emojiReactions}
              onEmoji={(e) => setCommentText((prev) => prev + e)}
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
        </KeyboardAvoidingView>
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  commentList: {
    flex: 1,
    paddingBottom: 120, // Add padding to prevent overlap with fixed input
  },
  scrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skeletonContainer: {
    padding: 12,
  },
  skeletonItem: {
    marginBottom: 12,
  },
  skeletonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  skeletonAvatar: {
    marginRight: 8,
  },
  skeletonText: {
    flex: 1,
  },
  skeletonName: {
    marginBottom: 4,
  },
  skeletonContent: {
    marginLeft: 40,
  },
  skeletonLine: {
    marginBottom: 4,
  },
  inputSection: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingHorizontal: 8,
  },
  inputSectionKeyboard: {
    // If you want extra padding when keyboard is open (optional)
    paddingBottom: Platform.OS === "ios" ? 24 : 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  errorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    color: "#ff4757",
  },
  fixedInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingHorizontal: 8,
  },
});
