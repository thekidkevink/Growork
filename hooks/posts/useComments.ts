import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useAuth } from '../auth/useAuth';
import { sendNotification } from '@/utils/notifications';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    username: string;
    name?: string;
    surname?: string;
    avatar_url?: string;
  };
}

export interface CommentState {
  comments: Comment[];
  loading: boolean;
  error: string | null;
}

export const formatCommentDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export function useComments(postId: string) {
  const [state, setState] = useState<CommentState>({
    comments: [],
    loading: false,
    error: null
  });

  const { user } = useAuth();
  const lastFetchedPostId = useRef<string | null>(null);

  const fetchComments = useCallback(async (targetPostId: string) => {
    if (!targetPostId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // First fetch comments
      const { data: commentsData } = await supabaseRequest<any[]>(
        async () => {
          const { data, error, status } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', targetPostId)
            .order('created_at', { ascending: true });
          return { data, error, status };
        },
        { logTag: 'comments:list' }
      );

      // Then fetch profiles for the user IDs
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

        const { data: profilesData } = await supabaseRequest<any[]>(
          async () => {
            const { data, error, status } = await supabase
              .from('legacy_public_profiles')
              .select('id, username, name, surname, avatar_url')
              .in('id', userIds);
            return { data, error, status };
          },
          { logTag: 'profiles:listForComments' }
        );

        // Create a map of user profiles
        const profilesMap = (profilesData || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Combine comments with profiles
        const commentsWithProfiles = commentsData.map(comment => ({
          ...comment,
          profile: profilesMap[comment.user_id] || null
        }));

        setState(prev => ({
          ...prev,
          comments: commentsWithProfiles,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          comments: [],
          loading: false
        }));
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch comments'
      }));
    }
  }, []);

  // Add a new comment
  const addComment = useCallback(async (content: string) => {
    if (!user || !postId || !content.trim()) {
      return { success: false, error: 'Invalid input' };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('comments')
            .insert({
              post_id: postId,
              user_id: user.id,
              content: content.trim()
            })
            .select('*')
            .single();
          return { data, error, status };
        },
        { logTag: 'comments:add' }
      );

      // Fetch the user's profile for the new comment
      let profile = null;
      try {
        const { data: profileData } = await supabaseRequest<any>(
          async () => {
            const { data, error, status } = await supabase
              .from('legacy_public_profiles')
              .select('id, username, name, surname, avatar_url')
              .eq('id', user.id)
              .maybeSingle();
            return { data, error, status };
          },
          { logTag: 'profiles:getForNewComment' }
        );

        if (profileData) {
          profile = profileData;
        }
      } catch (profileErr) {
        console.warn('Error fetching profile for new comment:', profileErr);
      }

      // Create comment with profile data
      const commentWithProfile = {
        ...data,
        profile
      };

      // Add new comment to local state
      setState(prev => ({
        ...prev,
        comments: [...prev.comments, commentWithProfile],
        loading: false
      }));

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
          { logTag: 'posts:getForCommentNotify' }
        );

        if (postData && postData.user_id !== user.id) {
          const senderName = profile?.name || profile?.username || 'Someone';
          const postTitle = postData.title || 'your post';
          const commentPreview = content.trim().length > 50
            ? content.trim().substring(0, 50) + '...'
            : content.trim();

          await sendNotification(
            postData.user_id,
            'New Comment',
            `${senderName} commented on ${postTitle}: "${commentPreview}"`,
            'post_comment',
            { postId, senderId: user.id, senderName, postTitle, commentId: data.id, commentPreview }
          );
        }
      } catch (notificationError) {
        console.error('Failed to send comment notification:', notificationError);
        // Don't fail the comment operation if notification fails
      }

      return { success: true, data: commentWithProfile };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add comment';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [user, postId]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await supabaseRequest<void>(
        async () => {
          const { error, status } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId)
            .eq('user_id', user.id); // Ensure user can only delete their own comments
          return { data: null, error, status };
        },
        { logTag: 'comments:delete' }
      );

      // Remove comment from local state
      setState(prev => ({
        ...prev,
        comments: prev.comments.filter(comment => comment.id !== commentId),
        loading: false
      }));

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete comment';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Update a comment
  const updateComment = useCallback(async (commentId: string, newContent: string) => {
    if (!user || !newContent.trim()) {
      return { success: false, error: 'Invalid input' };
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('comments')
            .update({
              content: newContent.trim(),
              updated_at: new Date().toISOString()
            })
            .eq('id', commentId)
            .eq('user_id', user.id) // Ensure user can only update their own comments
            .select('*')
            .single();
          return { data, error, status };
        },
        { logTag: 'comments:update' }
      );

      // Fetch the user's profile for the updated comment
      let profile = null;
      try {
        const { data: profileData } = await supabaseRequest<any>(
          async () => {
            const { data, error, status } = await supabase
              .from('legacy_public_profiles')
              .select('id, username, name, surname, avatar_url')
              .eq('id', user.id)
              .maybeSingle();
            return { data, error, status };
          },
          { logTag: 'profiles:getForUpdatedComment' }
        );

        if (profileData) {
          profile = profileData;
        }
      } catch (profileErr) {
        console.warn('Error fetching profile for updated comment:', profileErr);
      }

      // Create updated comment with profile data
      const updatedCommentWithProfile = {
        ...data,
        profile
      };

      // Update comment in local state
      setState(prev => ({
        ...prev,
        comments: prev.comments.map(comment =>
          comment.id === commentId ? updatedCommentWithProfile : comment
        ),
        loading: false
      }));

      return { success: true, data: updatedCommentWithProfile };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update comment';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [user]);

  // Fetch comments when postId changes
  useEffect(() => {
    if (postId && postId !== lastFetchedPostId.current) {
      lastFetchedPostId.current = postId;
      fetchComments(postId);
    }
  }, [postId, fetchComments]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    comments: state.comments,
    loading: state.loading,
    error: state.error,

    // Actions
    addComment,
    deleteComment,
    updateComment,
    fetchComments,
    clearError,

    // Utilities
    commentCount: state.comments.length
  };
}
