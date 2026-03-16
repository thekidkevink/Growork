import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useAuth } from '../auth/useAuth';
import { sendNotification } from '@/utils/notifications';

export interface InteractionState {
  loading: boolean;
  error: string | null;
}

export interface LikeState extends InteractionState {
  isLiked: boolean;
  likeCount: number;
}

export interface BookmarkState extends InteractionState {
  isBookmarked: boolean;
}

// Simplified hook for post interactions - fetches all data regardless of authentication
export function useInteractions() {
  const { user } = useAuth();

  // Like functionality
  const [likeStates, setLikeStates] = useState<Record<string, LikeState>>({});

  // Bookmark functionality
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, BookmarkState>>({});

  const getSafeLikeState = useCallback(
    (postId: string): LikeState => {
      const state = likeStates[postId];
      return {
        loading: state?.loading ?? false,
        error: state?.error ?? null,
        isLiked: state?.isLiked ?? false,
        likeCount: state?.likeCount ?? 0,
      };
    },
    [likeStates]
  );

  const getSafeBookmarkState = useCallback(
    (postId: string): BookmarkState => {
      const state = bookmarkStates[postId];
      return {
        loading: state?.loading ?? false,
        error: state?.error ?? null,
        isBookmarked: state?.isBookmarked ?? false,
      };
    },
    [bookmarkStates]
  );

  // LIKE OPERATIONS
  const checkLikeStatus = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          return { data, error, status };
        },
        { logTag: 'likes:isLiked', retries: 0 }
      );

      return !!data;
    } catch {
      return false;
    }
  }, [user]);

  // Batched like aggregates for a list of posts
  const getLikeAggregates = useCallback(async (postIds: string[]): Promise<{ counts: Record<string, number>; likedSet: Set<string> }> => {
    const counts: Record<string, number> = {};
    const likedSet = new Set<string>();
    if (!postIds?.length) return { counts, likedSet };

    try {
      const { data } = await supabaseRequest<{ post_id: string; user_id: string }[]>(
        async () => {
          const { data, error, status } = await supabase
            .from('likes')
            .select('post_id, user_id')
            .in('post_id', postIds);
          return { data, error, status };
        },
        { logTag: 'likes:listByPosts', retries: 1 }
      );

      for (const row of data || []) {
        counts[row.post_id] = (counts[row.post_id] || 0) + 1;
        if (user && row.user_id === user.id) likedSet.add(row.post_id);
      }
    } catch {
      // fallback: empty results
    }

    // Ensure all postIds have a count
    for (const id of postIds) if (!(id in counts)) counts[id] = 0;
    return { counts, likedSet };
  }, [user]);

  // Batched bookmarks for a list of posts for the current user
  const getBookmarksForPosts = useCallback(async (postIds: string[]): Promise<Set<string>> => {
    const set = new Set<string>();
    if (!user || !postIds?.length) return set;

    try {
      const { data } = await supabaseRequest<{ post_id: string }[]>(
        async () => {
          const { data, error, status } = await supabase
            .from('bookmarks')
            .select('post_id')
            .eq('user_id', user.id)
            .in('post_id', postIds);
          return { data, error, status };
        },
        { logTag: 'bookmarks:listByPosts', retries: 1 }
      );

      for (const row of data || []) set.add(row.post_id);
    } catch {
      // ignore
    }

    return set;
  }, [user]);

  const likePost = useCallback(async (postId: string) => {
    if (!user) return { success: false, error: 'Authentication required' };

    const previousState = getSafeLikeState(postId);
    const nextCount = previousState.isLiked
      ? previousState.likeCount
      : previousState.likeCount + 1;

    try {
      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          ...previousState,
          isLiked: true,
          likeCount: nextCount,
          loading: true,
          error: null,
        }
      }));

      await supabaseRequest<void>(
        async () => {
          const { error, status } = await supabase
            .from('likes')
            .insert({
              post_id: postId,
              user_id: user.id,
            });
          return { data: null, error, status };
        },
        { logTag: 'likes:like' }
      );

      // Send notification to post owner
      try {
        // Get post details to find the owner
        const { data: postData } = await supabaseRequest<any>(
          async () => {
            const { data, error, status } = await supabase
              .from('posts')
              .select('user_id, title')
              .eq('id', postId)
              .single();
            return { data, error, status };
          },
          { logTag: 'posts:getForLikeNotify' }
        );

        if (postData && postData.user_id !== user.id) {
          // Get user profile for notification
          const { data: userProfile } = await supabaseRequest<any>(
            async () => {
              const { data, error, status } = await supabase
                .from('legacy_public_profiles')
                .select('name, username')
                .eq('id', user.id)
                .single();
              return { data, error, status };
            },
            { logTag: 'profiles:getForLikeNotify' }
          );

          const senderName = userProfile?.name || userProfile?.username || 'Someone';
          const postTitle = postData.title || 'your post';

          await sendNotification(
            postData.user_id,
            'New Like',
            `${senderName} liked ${postTitle}`,
            'post_like',
            { postId, senderId: user.id, senderName, postTitle }
          );
        }
      } catch (notificationError) {
        console.error('Failed to send like notification:', notificationError);
        // Don't fail the like operation if notification fails
      }

      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          loading: false,
          error: null,
          isLiked: true,
          likeCount: nextCount
        }
      }));

      return { success: true, error: null };
    } catch (err: any) {
      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          ...previousState,
          loading: false,
          error: 'Failed to like post',
        }
      }));
      return { success: false, error: 'Failed to like post' };
    }
  }, [user, getSafeLikeState]);

  const unlikePost = useCallback(async (postId: string) => {
    if (!user) return { success: false, error: 'Authentication required' };

    const previousState = getSafeLikeState(postId);
    const nextCount = previousState.isLiked
      ? Math.max(0, previousState.likeCount - 1)
      : previousState.likeCount;

    try {
      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          ...previousState,
          isLiked: false,
          likeCount: nextCount,
          loading: true,
          error: null,
        }
      }));

      await supabaseRequest<void>(
        async () => {
          const { error, status } = await supabase
            .from('likes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
          return { data: null, error, status };
        },
        { logTag: 'likes:unlike' }
      );

      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          loading: false,
          error: null,
          isLiked: false,
          likeCount: nextCount
        }
      }));

      return { success: true, error: null };
    } catch (err: any) {
      setLikeStates(prev => ({
        ...prev,
        [postId]: {
          ...previousState,
          loading: false,
          error: 'Failed to unlike post',
        }
      }));
      return { success: false, error: 'Failed to unlike post' };
    }
  }, [user, getSafeLikeState]);

  const toggleLike = useCallback(async (postId: string) => {
    try {
      const existingState = likeStates[postId];
      const liked =
        typeof existingState?.isLiked === 'boolean'
          ? existingState.isLiked
          : await checkLikeStatus(postId);
      if (liked) {
        return unlikePost(postId);
      } else {
        return likePost(postId);
      }
    } catch {
      return { success: false, error: 'Failed to toggle like' };
    }
  }, [checkLikeStatus, likePost, unlikePost, likeStates]);

  // BOOKMARK OPERATIONS
  const checkBookmarkStatus = useCallback(async (postId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();
          return { data, error, status };
        },
        { logTag: 'bookmarks:isBookmarked', retries: 0 }
      );

      return !!data;
    } catch {
      return false;
    }
  }, [user]);

  const toggleBookmark = useCallback(async (postId: string) => {
    if (!user) return { success: false, error: 'Authentication required' };

    const previousState = getSafeBookmarkState(postId);
    const isBookmarked =
      typeof previousState.isBookmarked === 'boolean'
        ? previousState.isBookmarked
        : await checkBookmarkStatus(postId);

    try {
      setBookmarkStates(prev => ({
        ...prev,
        [postId]: {
          ...previousState,
          loading: true,
          error: null,
          isBookmarked: !isBookmarked,
        }
      }));

      if (isBookmarked) {
        // Remove bookmark
        await supabaseRequest<void>(
          async () => {
            const { error, status } = await supabase
              .from('bookmarks')
              .delete()
              .eq('post_id', postId)
              .eq('user_id', user.id);
            return { data: null, error, status };
          },
          { logTag: 'bookmarks:remove' }
        );

        setBookmarkStates(prev => ({
          ...prev,
          [postId]: {
            loading: false,
            error: null,
            isBookmarked: false
          }
        }));
      } else {
        // Add bookmark
        await supabaseRequest<void>(
          async () => {
            const { error, status } = await supabase
              .from('bookmarks')
              .insert({
                post_id: postId,
                user_id: user.id,
              });
            return { data: null, error, status };
          },
          { logTag: 'bookmarks:add' }
        );

        setBookmarkStates(prev => ({
          ...prev,
          [postId]: {
            loading: false,
            error: null,
            isBookmarked: true
          }
        }));
      }

      return { success: true, error: null };
    } catch (err: any) {
      setBookmarkStates(prev => ({
        ...prev,
        [postId]: {
          ...previousState,
          loading: false,
          error: 'Failed to toggle bookmark',
        }
      }));
      return { success: false, error: 'Failed to toggle bookmark' };
    }
  }, [user, checkBookmarkStatus, getSafeBookmarkState]);

  // Initialize post state - ALWAYS fetches data regardless of authentication
  const initializePost = useCallback(async (postId: string) => {
    try {
      const [{ counts, likedSet }, bookmarkSet] = await Promise.all([
        getLikeAggregates([postId]),
        getBookmarksForPosts([postId]),
      ]);

      const likeCount = counts[postId] || 0;

      if (user) {
        const isLiked = likedSet.has(postId);
        const isBookmarked = bookmarkSet.has(postId);

        setLikeStates(prev => ({
          ...prev,
          [postId]: {
            loading: false,
            error: null,
            isLiked,
            likeCount
          }
        }));

        setBookmarkStates(prev => ({
          ...prev,
          [postId]: {
            loading: false,
            error: null,
            isBookmarked
          }
        }));
      } else {
        // For non-authenticated users, show public data with default user states
        setLikeStates(prev => ({
          ...prev,
          [postId]: {
            loading: false,
            error: null,
            isLiked: false,
            likeCount
          }
        }));

        setBookmarkStates(prev => ({
          ...prev,
          [postId]: {
            loading: false,
            error: null,
            isBookmarked: false
          }
        }));
      }

    } catch (error) {
      console.error('Error initializing post:', error);
    }
  }, [user, getLikeAggregates, getBookmarksForPosts]);

  // Batched initializer for multiple posts (preferred for lists)
  const initializePosts = useCallback(async (postIds: string[]) => {
    try {
      if (!postIds?.length) return;

      // Likes aggregates and user like set
      const [{ counts, likedSet }, bookmarkSet] = await Promise.all([
        getLikeAggregates(postIds),
        getBookmarksForPosts(postIds)
      ]);

      // Apply like states
      setLikeStates(prev => {
        const next = { ...prev };
        for (const id of postIds) {
          next[id] = {
            loading: false,
            error: null,
            isLiked: user ? likedSet.has(id) : false,
            likeCount: counts[id] || 0,
          };
        }
        return next;
      });

      // Apply bookmark states
      setBookmarkStates(prev => {
        const next = { ...prev };
        for (const id of postIds) {
          next[id] = {
            loading: false,
            error: null,
            isBookmarked: user ? bookmarkSet.has(id) : false,
          };
        }
        return next;
      });
    } catch (error) {
      console.error('Error initializing posts batch:', error);
    }
  }, [user, getLikeAggregates, getBookmarksForPosts]);

  return {
    likeStates,
    bookmarkStates,
    likePost,
    unlikePost,
    toggleLike,
    toggleBookmark,
    initializePost,
    initializePosts,
  };
}
