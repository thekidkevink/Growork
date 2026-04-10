import React, { useEffect, useState, useMemo } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useAuth,
  useThemeColor,
  useApplicationStatus,
  useTextToSpeech,
  usePostById,
  useComments,
  formatCommentDate,
  useCustomCommentsBottomSheet,
} from "@/hooks";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ScreenContainer from "@/components/ScreenContainer";

const formatSalaryLabel = (salary?: string | null) =>
  salary ? salary.replace(/\$/g, "N$") : salary;
import UniversalHeader from "@/components/ui/UniversalHeader";
import { Post } from "@/types";
import { PostType } from "@/types/enums";

import PostInteractionBar from "@/components/content/PostInteractionBar";
import ApplyButton from "@/components/content/post/ApplyButton";

import ThemedButton from "@/components/ui/ThemedButton";
import { openGlobalSheet } from "@/utils/globalSheet";
import JobApplicationForm from "@/components/content/JobApplicationForm";
import { PostSkeleton } from "@/components/ui/Skeleton";

const ICON_SIZE = 20;

const PostDetail = () => {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const { comments, loading: commentsLoading } = useComments(id || "");
  const { openCommentsSheet } = useCustomCommentsBottomSheet();

  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const mutedTextColor = useThemeColor({}, "mutedText");
  const applicationPostIds = useMemo(() => (id ? [id] : []), [id]);
  const {
    statuses: applicationStatuses,
    loading: applicationLoading,
    refresh: checkApplicationStatus,
  } = useApplicationStatus({ postIds: applicationPostIds, single: true });
  const application = applicationStatuses[0] || null;
  const hasApplied = !!application;
  const { speak, stop, isSpeaking, isPaused } = useTextToSpeech();
  const { getPostById, loading: postLoading } = usePostById();

  // Cleanup text-to-speech when component unmounts
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const { data } = await getPostById(id as string);
        setPost(data);
      }
    };
    fetchData();
  }, [id, getPostById]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
    if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
    return `${Math.floor(diff / 365)} years ago`;
  };

  const handleSourcePress = () => {
    if (post?.criteria?.source) {
      void Linking.openURL(post.criteria.source);
    }
  };

  const handleMoreOptions = () => {
    if (!post) {
      return;
    }

    const currentPost = post;
    const postUrl = `https://growork.app/post/${currentPost.id}`;

    Alert.alert("Post Options", "Choose an action", [
      {
        text: "Share",
        onPress: async () => {
          try {
            await Share.share({
              title: currentPost.title || "Post",
              message: `Check out this post on GROWORK: ${postUrl}`,
              url: postUrl,
            });
          } catch {
            // share dismissal should stay quiet
          }
        },
      },
      {
        text: "Open link",
        onPress: async () => {
          try {
            await Linking.openURL(postUrl);
          } catch {
            Alert.alert("Error", "Could not open the post link.");
          }
        },
      },
      ...(currentPost.criteria?.source
        ? [
            {
              text: "Open source",
              onPress: handleSourcePress,
            },
          ]
        : []),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (postLoading) {
    return (
      <ScreenContainer>
        <UniversalHeader
          title=""
          showBackButton={true}
          showNotifications={false}
        />
        <PostSkeleton />
      </ScreenContainer>
    );
  }

  if (!post) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Post not found</ThemedText>
      </ThemedView>
    );
  }

  const isJob = post.type === PostType.Job;
  const isNews = post.type === PostType.News;
  const isOwner = !!user?.id && user.id === post.user_id;

  return (
    <ScreenContainer>
      <UniversalHeader
        title=""
        showBackButton={true}
        showNotifications={false}
        rightAction={{
          icon: isSpeaking ? (isPaused ? "play" : "pause") : "volume-2",
          onPress: () => {
            if (post) {
              const textToSpeak = `${post.title}. ${post.content}`;
              speak(textToSpeak);
            }
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ThemedView style={styles.contentContainer}>
          {/* Title */}
          <ThemedText style={styles.postTitle}>{post.title}</ThemedText>

          {/* Company Info - Minimal */}
          {isJob && post.criteria?.company && (
            <RNView style={styles.companyRow}>
              <Image
                source={{
                  uri:
                    post.criteria?.companyLogo ||
                    post.company_logo ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      post.criteria.company || "Company"
                    )}&size=64`,
                }}
                style={styles.companyLogo}
              />
              <RNView style={styles.companyInfo}>
                <ThemedText
                  style={[styles.companyName, { color: mutedTextColor }]}
                >
                  {post.criteria.company}
                </ThemedText>
                {post.criteria.location && (
                  <ThemedText
                    style={[styles.locationText, { color: mutedTextColor }]}
                  >
                    | {post.criteria.location}
                  </ThemedText>
                )}
              </RNView>
            </RNView>
          )}

          {/* Image - only show if provided */}
          {post.image_url && (
            <RNView style={styles.imageContainer}>
              <Image
                source={{ uri: post.image_url }}
                style={styles.featureImage}
                resizeMode="cover"
              />
            </RNView>
          )}

          {/* Content */}
          <ThemedText style={styles.description}>{post.content}</ThemedText>

          {/* Minimal Job Details */}
          {isJob && (
            <RNView style={styles.jobDetails}>
              {post.criteria?.salary && (
                <RNView style={styles.detailItem}>
                  <Feather
                    name="dollar-sign"
                    size={14}
                    color={mutedTextColor}
                  />
                  <ThemedText
                    style={[styles.detailText, { color: mutedTextColor }]}
                  >
                    {formatSalaryLabel(post.criteria.salary)}
                  </ThemedText>
                </RNView>
              )}
              {post.criteria?.jobType && (
                <RNView style={styles.detailItem}>
                  <Feather name="clock" size={14} color={mutedTextColor} />
                  <ThemedText
                    style={[styles.detailText, { color: mutedTextColor }]}
                  >
                    {post.criteria.jobType}
                  </ThemedText>
                </RNView>
              )}
            </RNView>
          )}

          {/* Timestamp */}
          <ThemedText style={[styles.timestamp, { color: mutedTextColor }]}>
            {formatDate(post.created_at)}
          </ThemedText>

          {/* Application Status - Minimal */}
          {isJob && hasApplied && application && (
            <RNView
              style={[styles.applicationStatus, { borderColor: borderColor }]}
            >
              <RNView style={styles.applicationStatusHeader}>
                <Feather name="check-circle" size={16} color={textColor} />
                <ThemedText
                  style={[styles.applicationStatusTitle, { color: textColor }]}
                >
                  Applied
                </ThemedText>
              </RNView>
              <ThemedText
                style={[
                  styles.applicationStatusText,
                  { color: mutedTextColor },
                ]}
              >
                {formatDate(application.created_at)}
              </ThemedText>
            </RNView>
          )}
        </ThemedView>

        {/* Actions - Minimal */}
        <ThemedView
          style={[styles.actionsContainer, { borderTopColor: borderColor }]}
        >
          <PostInteractionBar
            postId={post.id}
            postOwnerId={post.user_id}
            size="large"
          />
          {isJob && isOwner ? (
            <ThemedButton
              title="View Applicants"
              onPress={() => router.push("/(tabs)/applications")}
              variant="primary"
              size="medium"
            />
          ) : null}
          {isJob && !isOwner ? (
            <ApplyButton
              onPress={() => {
                if (post && !hasApplied) {
                  openGlobalSheet({
                    snapPoints: ["90%"],
                    children: (
                      <JobApplicationForm
                        jobPost={post}
                        onSuccess={() => {
                          checkApplicationStatus();
                          router.back();
                        }}
                      />
                    ),
                  });
                } else if (hasApplied) {
                  // If already applied, just stay on the post details page
                  // The button will show "Applied" and be disabled
                }
              }}
              size="medium"
              applied={hasApplied}
              disabled={applicationLoading}
            />
          ) : null}
          {isNews && post.criteria?.source && (
            <ThemedButton
              title="Read More"
              onPress={handleSourcePress}
              variant="primary"
              size="medium"
            />
          )}
        </ThemedView>
        {!commentsLoading && comments.length > 0 && (
          <ThemedView
            style={[styles.commentsContainer, { borderTopColor: borderColor }]}
          >
            <RNView style={styles.commentsHeader}>
              <ThemedText style={styles.commentsTitle}>Comments</ThemedText>
              <TouchableOpacity
                onPress={() => openCommentsSheet(post.id, post.user_id)}
                style={styles.commentsAction}
              >
                <ThemedText style={[styles.commentsLink, { color: textColor }]}>
                  View all
                </ThemedText>
                <Feather name="chevron-right" size={16} color={mutedTextColor} />
              </TouchableOpacity>
            </RNView>

            {comments.slice(0, 3).map((comment) => {
              const displayName =
                [comment.profile?.name, comment.profile?.surname]
                  .filter(Boolean)
                  .join(" ")
                  .trim() ||
                comment.profile?.username ||
                "User";

              return (
                <TouchableOpacity
                  key={comment.id}
                  style={[styles.commentPreviewCard, { borderColor }]}
                  onPress={() => openCommentsSheet(post.id, post.user_id)}
                  activeOpacity={0.85}
                >
                  <RNView style={styles.commentPreviewHeader}>
                    <ThemedText style={styles.commentAuthor}>
                      {displayName}
                    </ThemedText>
                    <ThemedText
                      style={[styles.commentTime, { color: mutedTextColor }]}
                    >
                      {formatCommentDate(comment.created_at)}
                    </ThemedText>
                  </RNView>
                  <ThemedText style={styles.commentContent} numberOfLines={3}>
                    {comment.content}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
    lineHeight: 28,
  },
  textToSpeechContainer: {
    marginBottom: 16,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "500",
  },
  locationText: {
    fontSize: 14,
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: "500",
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 4,
    overflow: "hidden",
  },
  featureImage: {
    width: "100%",
    height: 200,
    borderRadius: 4,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  jobDetails: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 20,
  },
  applicationStatus: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 20,
  },
  applicationStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  applicationStatusTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  applicationStatusText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  commentsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  commentsAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentsLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentPreviewCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  commentPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PostDetail;

