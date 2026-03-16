import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { Comment } from '@/types';

export interface CommentWithProfile extends Comment {
  profiles?: {
    id: string;
    name: string;
    surname: string;
    avatar_url?: string;
  };
}

export function useCommentOperations() {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);

  // Fetch comments for a specific post
  const fetchComments = useCallback(async (postId: string): Promise<CommentWithProfile[]> => {
    try {
      // First fetch comments
      const { data: commentsData } = await supabaseRequest<any[]>(
        async () => {
          const { data, error, status } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false });
          return { data, error, status };
        },
        { logTag: 'comments:listForPost' }
      );

      // Then fetch profiles for the user IDs
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(comment => comment.user_id))];

        const { data: profilesData } = await supabaseRequest<any[]>(
          async () => {
            const { data, error, status } = await supabase
              .from('legacy_public_profiles')
              .select('id, name, surname, avatar_url')
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
          profiles: profilesMap[comment.user_id] || null
        }));

        setComments(commentsWithProfiles);
        return commentsWithProfiles;
      } else {
        setComments([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }, []);

  // Add a new comment
  const addComment = useCallback(async (postId: string, userId: string, content: string): Promise<CommentWithProfile> => {
    try {
      const { data } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('comments')
            .insert([{ post_id: postId, user_id: userId, content }])
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
              .select('id, name, surname, avatar_url')
              .eq('id', userId)
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
      const newComment = {
        ...data,
        profiles: profile
      } as CommentWithProfile;

      // Add the new comment to the list
      setComments(prev => [newComment, ...prev]);

      return newComment;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, []);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      await supabaseRequest<void>(
        async () => {
          const { error, status } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);
          return { data: null, error, status };
        },
        { logTag: 'comments:delete' }
      );

      // Remove the comment from the list
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }, []);

  return {
    comments,
    fetchComments,
    addComment,
    deleteComment,
    setComments
  };
}
